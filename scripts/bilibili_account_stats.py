#!/usr/bin/env python3
"""手动获取 Bilibili 创作中心最近 90 天每日统计（净增 + 历史累计），
保存到 data/bilibili/<执行日期>/account.csv。"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

SHANGHAI = timezone(timedelta(hours=8))
DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "bilibili"
COOKIE_PATH = Path(__file__).resolve().parents[1] / "data" / ".bilibili_cookie"
API = "https://member.bilibili.com/x/web/data/v2/overview/stat/graph"
TOTAL_API = "https://member.bilibili.com/x/web/index/stat"
DAYS = 90
METRICS = (
    ("播放量", "play"),
    ("空间访客", "visitor"),
    ("净增粉丝", "fan"),
    ("点赞", "like"),
    ("收藏", "fav"),
    ("硬币", "coin"),
    ("评论", "comment"),
    ("弹幕", "dm"),
    ("分享", "share"),
)

# 总累计接口字段映射（空间访客无对应字段，留空）
TOTAL_FIELD_MAP = {
    "play": "total_click",
    "fan": "total_fans",
    "like": "total_like",
    "fav": "total_fav",
    "coin": "total_coin",
    "comment": "total_reply",
    "dm": "total_dm",
    "share": "total_share",
}


def build_header():
    header = ["时间"]
    for name, _ in METRICS:
        header.extend([name, f"{name}累计"])
    return header


HEADER = build_header()


class StatsError(Exception):
    pass


def load_cookie(path):
    cookie = os.environ.get("BILIBILI_COOKIE", "").strip()
    if not cookie and path.exists():
        cookie = path.read_text(encoding="utf-8").strip()
    if not cookie:
        raise StatsError("缺少 Cookie：设置 BILIBILI_COOKIE，或将完整 Cookie 存入 data/.bilibili_cookie")
    if cookie.lower().startswith("cookie:"):
        cookie = cookie.split(":", 1)[1].strip()
    if "\n" in cookie or "\r" in cookie:
        raise StatsError("Cookie 必须是单行 Name=Value; Name=Value 格式")
    return cookie


def fetch_daily(cookie):
    params = {"period": 2, "s_locale": "zh_CN",
              "type": ",".join(key for _, key in METRICS), "tmid": ""}
    request = Request(
        API + "?" + urlencode(params),
        headers={
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://member.bilibili.com/platform/data-up/video/",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=25) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise StatsError(f"创作中心请求失败：{exc}") from exc
    if payload.get("code") != 0:
        raise StatsError(f"创作中心返回 code={payload.get('code')}：{payload.get('message')}")
    return parse_daily(payload.get("data"))


def fetch_total_stats(cookie):
    """获取账号当前的历史累积量（总播放、总粉丝等）。"""
    request = Request(
        TOTAL_API,
        headers={
            "Cookie": cookie,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://member.bilibili.com/platform/home",
            "Accept": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=25) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise StatsError(f"获取总累计请求失败：{exc}") from exc
    if payload.get("code") != 0:
        raise StatsError(f"获取总累计返回 code={payload.get('code')}：{payload.get('message')}")
    data = payload.get("data")
    if not isinstance(data, dict):
        raise StatsError("总累计接口响应缺少 data")
    totals = {}
    for key, field in TOTAL_FIELD_MAP.items():
        val = data.get(field)
        if val is not None:
            try:
                totals[key] = _as_int(val)
            except (ValueError, TypeError):
                raise StatsError(f"总累计字段 {field} 的值无法解析为整数")
        else:
            totals[key] = None
    return totals


def _as_int(value):
    if isinstance(value, bool) or int(value) != value:
        raise ValueError("不是整数")
    return int(value)


def parse_daily(data):
    """返回 {date: [inc1, inc2, ...]}，仅包含每日增量。"""
    if not isinstance(data, dict) or not isinstance(data.get("data_tendency"), dict):
        raise StatsError("接口响应缺少 data.data_tendency；可能是接口结构已变化")
    tendencies = data["data_tendency"]
    by_metric = {}
    for name, key in METRICS:
        entries = tendencies.get(key)
        if not isinstance(entries, list) or not entries:
            raise StatsError(f"接口缺少 {name}（{key}）的每日数据")
        daily = {}
        for entry in entries:
            try:
                day = datetime.fromtimestamp(int(entry["date_key"]), SHANGHAI).date()
                inc = _as_int(entry["total_inc"])
            except (KeyError, TypeError, ValueError, OverflowError) as exc:
                raise StatsError(f"{name} 存在无法解析的日期或数值") from exc
            if day in daily:
                if daily[day] != inc:
                    raise StatsError(f"{name} 在 {day} 有互相冲突的增量数据")
            daily[day] = inc
        by_metric[key] = daily

    common = set.intersection(*(set(values) for values in by_metric.values()))
    if not common:
        raise StatsError("各指标没有共同的日期")

    result = {}
    for day in common:
        row = [by_metric[key][day] for _, key in METRICS]
        result[day] = row
    return result


def save_batch(run_dir, daily_inc, dates_to_save, total_stats, dry_run=False):
    """把多天数据写到 run_dir/account.csv，一行一天，每指标两列（净增 / 累计）。
    累计列通过最后一天的总累计向前倒推得到。"""
    metric_keys = [key for _, key in METRICS]
    n_days = len(dates_to_save)
    n_metrics = len(METRICS)

    # 初始化累计值二维列表：cumulative[metric_idx][day_idx]
    cumulative = [[None] * n_days for _ in range(n_metrics)]

    # 最后一天的累计值来自 total_stats
    last_idx = n_days - 1
    for m_idx, key in enumerate(metric_keys):
        total = total_stats.get(key)
        if total is not None:
            cumulative[m_idx][last_idx] = total

    # 从后向前倒推：前一天累计 = 后一天累计 - 后一天增量
    for m_idx, key in enumerate(metric_keys):
        for day_idx in range(last_idx - 1, -1, -1):
            next_idx = day_idx + 1
            next_cum = cumulative[m_idx][next_idx]
            if next_cum is None:
                cumulative[m_idx][day_idx] = None
                continue
            next_inc = daily_inc[dates_to_save[next_idx]][m_idx]
            cumulative[m_idx][day_idx] = next_cum - next_inc

    # 构建行
    rows = []
    for day_idx, day in enumerate(dates_to_save):
        if day not in daily_inc:
            raise StatsError(f"接口没有提供 {day} 的数据")
        incs = daily_inc[day]
        row = [day.strftime("%Y/%m/%d")]
        for m_idx, (name, key) in enumerate(METRICS):
            inc = incs[m_idx]
            row.append(str(inc))
            cum = cumulative[m_idx][day_idx]
            row.append(str(cum) if cum is not None else "")
        rows.append(row)

    csv_path = run_dir / "account.csv"
    if dry_run:
        return csv_path, rows

    run_dir.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(HEADER)
        writer.writerows(rows)
    return csv_path, rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DATA_DIR,
                        help="保存数据的根目录，默认 data/bilibili")
    parser.add_argument("--cookie-file", type=Path, default=COOKIE_PATH,
                        help="只含完整 Cookie 的本地文件；环境变量 BILIBILI_COOKIE 优先")
    parser.add_argument("--days", type=int, default=DAYS,
                        help="获取最近多少天的数据，默认 90")
    parser.add_argument("--dry-run", action="store_true", help="只预览，不写入文件")
    args = parser.parse_args()

    now = datetime.now(SHANGHAI)
    if now.hour < 12:
        parser.error("B 站通常在北京时间中午更新昨日数据，请在 12:00 后运行")

    yesterday = now.date() - timedelta(days=1)
    start = yesterday - timedelta(days=args.days - 1)
    dates_to_save = [start + timedelta(days=i) for i in range(args.days)]

    # 文件夹名用“执行日期”（今天）
    run_dir = args.data_dir / now.date().strftime("%Y-%m-%d")

    try:
        cookie = load_cookie(args.cookie_file)
        daily_inc = fetch_daily(cookie)
        total_stats = fetch_total_stats(cookie)
    except StatsError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 1

    missing = [day for day in dates_to_save if day not in daily_inc]
    if missing:
        print(f"错误：接口尚未提供以下日期的全部指标：{', '.join(map(str, missing))}", file=sys.stderr)
        return 1

    try:
        csv_path, rows = save_batch(run_dir, daily_inc, dates_to_save, total_stats, args.dry_run)
    except StatsError as exc:
        print(f"错误：{exc}", file=sys.stderr)
        return 1

    if args.dry_run:
        print(f"预览：{csv_path}（{len(rows)} 行数据，表头 {len(HEADER)} 列）")
        for row in rows:
            print("  ", *row)
        return 0

    print(f"已保存：{csv_path}")
    print(f"共 {len(rows)} 天数据，时间范围 {dates_to_save[0]} ~ {dates_to_save[-1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
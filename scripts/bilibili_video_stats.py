#!/usr/bin/env python3
"""Export public statistics for every video in a Bilibili user's 投稿 list."""

import argparse
import csv
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit
from urllib.request import Request, urlopen

API = "https://api.bilibili.com"
MIXIN = (46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
         27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
         37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
         22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52)
FIELDS = ("bvid", "title", "published_at", "url", "view", "like", "coin",
          "favorite", "share", "danmaku", "reply")
STAT_FIELDS = FIELDS[4:]          # view, like, coin, favorite, share, danmaku, reply
SUMMARIES = (("Apple Music", "Apple Music"), ("还原", "编曲还原"))


class APIError(Exception):
    pass


def get_json(path, params=None, cookie=None, referer="https://www.bilibili.com/"):
    query = "&".join(f"{quote(str(k), safe='')}={quote(str(v), safe='')}"
                     for k, v in (params or {}).items())
    url = API + path + ("?" + query if query else "")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": referer,
        "Accept": "application/json",
    }
    if cookie:
        headers["Cookie"] = cookie
    try:
        with urlopen(Request(url, headers=headers), timeout=20) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise APIError(f"请求 {path} 失败：{exc}") from exc
    if payload.get("code") != 0 and not (path == "/x/web-interface/nav" and
                                         payload.get("code") == -101 and
                                         (payload.get("data") or {}).get("wbi_img")):
        raise APIError(f"{path} 返回 code={payload.get('code')}：{payload.get('message')}")
    return payload["data"]


def wbi_key(cookie):
    data = get_json("/x/web-interface/nav", cookie=cookie)
    images = data["wbi_img"]
    raw = "".join(urlsplit(images[name]).path.rsplit("/", 1)[-1].split(".")[0]
                  for name in ("img_url", "sub_url"))
    return "".join(raw[index] for index in MIXIN)[:32]


def session_cookie():
    # A genuine Bilibili-issued visitor ID is useful even without login.
    full = os.getenv("BILIBILI_COOKIE", "").strip()
    sessdata = os.getenv("BILIBILI_SESSDATA", "").strip()
    if full:
        return full
    parts = []
    if sessdata:
        parts.append(f"SESSDATA={sessdata}")
    finger = get_json("/x/frontend/finger/spi")
    for field, name in (("b_3", "buvid3"), ("b_4", "buvid4")):
        if finger.get(field):
            parts.append(f"{name}={finger[field]}")
    return "; ".join(parts)


def signed_params(params, key):
    params = {**params, "wts": int(time.time())}
    filtered = {k: re.sub(r"[!'()*]", "", str(v)) for k, v in params.items()}
    query = "&".join(f"{quote(k, safe='')}={quote(v, safe='')}"
                     for k, v in sorted(filtered.items()))
    return {**filtered, "w_rid": hashlib.md5((query + key).encode()).hexdigest()}


def parse_uid(value):
    match = re.fullmatch(r"(?:https?://space\.bilibili\.com/)?(\d+)/?", value)
    if not match:
        raise argparse.ArgumentTypeError("请提供数字 UID 或 https://space.bilibili.com/<UID>；昵称不是 UID")
    return match.group(1)


def build_summary(videos, keyword, title):
    """把标题含 keyword 的视频的数值字段求和，拼成一行汇总记录。

    返回 (row, matched_count)；没有匹配到任何视频时 row 为 None。
    """
    matched = [video for video in videos if keyword in video["title"]]
    if not matched:
        return None, 0
    # 除 title 外的文本字段（bvid / published_at / url）留空
    row = {field: "" for field in FIELDS}
    row["title"] = title
    for field in STAT_FIELDS:
        row[field] = sum(video[field] or 0 for video in matched)
    return row, len(matched)


def export(uid, output, delay, cookie):
    key = wbi_key(cookie)
    rows = []
    seen = set()
    page = 1
    while True:
        params = signed_params({"mid": uid, "pn": page, "ps": 30, "order": "pubdate",
                                "platform": "web", "web_location": "1550101",
                                "order_avoided": "true"}, key)
        data = get_json("/x/space/wbi/arc/search", params, cookie,
                        referer=f"https://space.bilibili.com/{uid}/video")
        videos = (data.get("list") or {}).get("vlist") or []
        total = (data.get("page") or {}).get("count", 0)
        print(f"第 {page} 页：{len(videos)} 个视频，总数 {total}", file=sys.stderr)
        if page == 1 and total == 0:
            raise APIError(f"UID {uid} 的投稿列表为空；请核对个人空间 URL 中的数字 UID")
        for video in videos:
            bvid = video.get("bvid")
            if not bvid or bvid in seen:
                continue
            seen.add(bvid)
            time.sleep(delay)
            detail = get_json("/x/web-interface/view", {"bvid": bvid}, cookie)
            owner_mid = str((detail.get("owner") or {}).get("mid"))
            if owner_mid != uid:
                raise APIError(f"{bvid} 的投稿者 UID 为 {owner_mid}，与指定的 {uid} 不符")
            stat = detail.get("stat") or {}
            rows.append({
                "bvid": bvid,
                "title": detail.get("title", ""),
                "published_at": datetime.fromtimestamp(detail["pubdate"], timezone.utc).isoformat(),
                "url": f"https://www.bilibili.com/video/{bvid}",
                **{field: stat.get(field) for field in STAT_FIELDS},
            })
            print(f"  {len(rows)}. {bvid}", file=sys.stderr)
        if not videos or page * 30 >= total:
            break
        page += 1
        time.sleep(delay)

    video_count = len(rows)

    # 在写入 CSV 之前追加汇总行；用快照避免汇总行自身被再次统计。
    snapshot = rows[:]
    for keyword, title in SUMMARIES:
        summary, matched = build_summary(snapshot, keyword, title)
        if summary is None:
            print(f"没有标题包含“{keyword}”的视频，跳过 {title} 汇总行", file=sys.stderr)
            continue
        rows.append(summary)
        print(f"汇总行 {title}：{matched} 个视频", file=sys.stderr)

    # Only publish a complete export; an API error leaves any previous CSV intact.
    os.makedirs(os.path.dirname(output) or ".", exist_ok=True)
    temp = output + ".tmp"
    try:
        with open(temp, "w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS)
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temp, output)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return video_count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("uid", type=parse_uid, help="个人空间 URL 或数字 UID（不能使用昵称）")
    parser.add_argument("-o", "--output", default=os.path.join("data", "bilibili", datetime.now().strftime("%Y-%m-%d"), "videos.csv"))
    parser.add_argument("--delay", type=float, default=1.5, help="请求间隔秒数，默认 1.5")
    args = parser.parse_args()
    if args.delay < 0:
        parser.error("--delay 不能小于 0")
    try:
        count = export(args.uid, args.output, args.delay, session_cookie())
    except (APIError, KeyError, ValueError) as exc:
        print(f"错误：{exc}", file=sys.stderr)
        print("若仍遇到 -352/412，请在浏览器登录后设置 BILIBILI_COOKIE 为该站点的完整 Cookie；不要公开 Cookie。", file=sys.stderr)
        return 1
    print(f"已导出 {count} 个视频到 {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
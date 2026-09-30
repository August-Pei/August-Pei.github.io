#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
overall_data.py

读取各平台最新日期文件夹下的数据，输出为 JSON：
  - data/bilibili/<date>/account.csv     -> 累计数据
  - data/rednote/<date>/notes.xlsx       -> 总计行
  - data/douyin/<date>/videos.xlsx       -> 总计行
  - data/douyin/<date>/fans.xlsx         -> 最后一行日期的总粉丝量
  - data/kuaishou/<date>/videos.xlsx     -> 总计行（找不到则读 videos.csv）
  - data/YouTube/<date>/videos.csv       -> 第二行 Total 行
  - data/TikTok/<date>/videos.xlsx       -> 最后一行总计
  - data/Instagram/<date>/videos.csv     -> 最后一行（All 行）
每个平台带有各自的 date 字段，date 取自对应数据文件夹名。
最后额外输出 "total" 字段：对所有平台同名字段求和，并给出 engagement 互动总量。
同时输出两个由各平台视频明细重新计算的内容系列汇总：
  - apple_music：标题中包含 "Apple Music" 的视频；
  - remake：标题中包含“还原”或 "remake" 的视频。
内容系列汇总不会使用数据表中已有的分类汇总行。
另外输出 viral_works，按支持 &、| 和括号的检索表达式，聚合指定爆款作品
在各个平台上的数据，并保留各平台明细与命中作品数。
同时输出 viral_rate：以全部平台的视频明细为样本，播放量达到全部视频
播放量中位数 2 倍及以上的视频视为爆款。
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from statistics import median
from typing import Any

from openpyxl import load_workbook


# 当前文件所在目录：scripts/
BASE_DIR = Path(__file__).resolve().parent

# 项目根目录：scripts/ 的上一级
PROJECT_ROOT = BASE_DIR.parent

# 数据目录
BILIBILI_DIR = PROJECT_ROOT / "data" / "bilibili"
REDNOTE_DIR = PROJECT_ROOT / "data" / "rednote"
DOUYIN_DIR = PROJECT_ROOT / "data" / "douyin"
KUAISHOU_DIR = PROJECT_ROOT / "data" / "kuaishou"
YOUTUBE_DIR = PROJECT_ROOT / "data" / "YouTube"
TIKTOK_DIR = PROJECT_ROOT / "data" / "TikTok"
INSTAGRAM_DIR = PROJECT_ROOT / "data" / "Instagram"

# 文件夹日期格式，例如 2026-09-18
FOLDER_DATE_FMT = "%Y-%m-%d"


# ---------- 各平台字段映射 ----------

# Bilibili CSV 累计字段 -> 输出 JSON 字段名
BILIBILI_FIELD_MAPPING = {
    "播放量累计": "views",
    "净增粉丝累计": "fans",
    "点赞累计": "likes",
    "收藏累计": "saves",
    "硬币累计": "coins",
    "评论累计": "comments",
    "弹幕累计": "danmakus",
    "分享累计": "shares",
}

# 小红书 Excel 列名 -> 输出 JSON 字段名
REDNOTE_FIELD_MAPPING = {
    "浏览量": "views",
    "点赞量": "likes",
    "收藏量": "saves",
    "评论数": "comments",
    "转发数": "shares",
    "粉丝数": "fans",
}

# 抖音 videos.xlsx 列名 -> 输出 JSON 字段名
DOUYIN_VIDEO_FIELD_MAPPING = {
    "播放量": "views",
    "点赞量": "likes",
    "分享量": "shares",
    "评论量": "comments",
    "收藏量": "saves",
}

# 快手 videos.xlsx/csv：输出字段 -> 候选列名（按顺序尝试，不区分大小写）
KUAISHOU_COLUMN_ALIASES = {
    "views": ["播放量", "views"],
    "likes": ["点赞量", "likes"],
    "shares": ["转发量", "分享量", "shares"],
    "comments": ["评论量", "comments"],
    "saves": ["收藏量", "saves"],
    "fans": ["粉丝量", "粉丝数", "fans", "followers", "subscribers"],
}

# YouTube videos.csv：输出字段 -> 候选列名（不区分大小写）
YOUTUBE_COLUMN_ALIASES = {
    "views": ["views", "view", "播放量", "观看次数"],
    "likes": ["likes", "like", "点赞量", "点赞"],
    "shares": ["shares", "share", "分享量", "分享", "转发量"],
    "comments": ["comments added", "comments", "comment", "评论量", "评论"],
    "fans": ["subscribers", "subscriber", "fans", "订阅者", "订阅数", "订阅量"],
}

# TikTok videos.xlsx：输出字段 -> 候选列名（不区分大小写）
TIKTOK_COLUMN_ALIASES = {
    "views": ["播放量", "views"],
    "likes": ["点赞量", "likes"],
    "saves": ["收藏量", "saves"],
    "comments": ["评论量", "comments"],
    "shares": ["分享量", "转发量", "shares"],
    "fans": ["粉丝量", "粉丝数", "fans", "followers", "subscribers"],
}

# Instagram videos.csv：输出字段 -> 候选列名（不区分大小写）
INSTAGRAM_COLUMN_ALIASES = {
    "views": ["views", "view", "播放量", "观看次数"],
    "likes": ["likes", "like", "点赞量", "点赞"],
    "comments": ["comments", "comment", "评论量", "评论"],
    "shares": ["shares", "share", "分享量", "分享", "转发量"],
    "fans": ["fans", "followers", "follower", "subscribers", "subscriber",
             "粉丝数", "粉丝量", "订阅者"],
}


# ---------- 通用工具 ----------

def to_int(value: Any) -> int:
    """把任意值转成 int，空值/非法值按 0 处理；自动去掉千分位逗号。"""
    if value is None:
        return 0
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(value)
    text = str(value).strip().replace(",", "").replace("，", "")
    if text == "":
        return 0
    try:
        return int(float(text))
    except ValueError:
        return 0


def find_latest_dir(root: Path) -> Path:
    """在 root 下找到名字格式为 %Y-%m-%d 且日期最晚的子文件夹。"""
    if not root.is_dir():
        raise FileNotFoundError(f"目录不存在: {root}")

    candidates = []
    for child in root.iterdir():
        if not child.is_dir():
            continue
        try:
            folder_date = datetime.strptime(child.name, FOLDER_DATE_FMT).date()
        except ValueError:
            continue
        candidates.append((folder_date, child))

    if not candidates:
        raise FileNotFoundError(
            f"未找到格式为 {FOLDER_DATE_FMT} 的日期文件夹: {root}"
        )

    return max(candidates, key=lambda item: item[0])[1]


def load_sheet_rows(xlsx_path: Path) -> list[tuple]:
    """读取 xlsx 活动 sheet 的所有行，返回 list[tuple]。"""
    wb = load_workbook(xlsx_path, data_only=True, read_only=True)
    try:
        ws = wb.active
        rows = [tuple(r) for r in ws.iter_rows(values_only=True)]
    finally:
        wb.close()

    if not rows:
        raise ValueError(f"xlsx 没有数据: {xlsx_path}")

    return rows


def load_csv_rows(csv_path: Path) -> list[tuple]:
    """读取 CSV 所有行，返回 list[tuple]。"""
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        rows = [tuple(r) for r in reader]

    if not rows:
        raise ValueError(f"csv 没有数据: {csv_path}")

    return rows


def load_table(path: Path) -> tuple[list[str], list[tuple]]:
    """统一读取 xlsx / csv，返回 (header, rows)。"""
    if path.suffix.lower() == ".csv":
        rows = load_csv_rows(path)
    else:
        rows = load_sheet_rows(path)

    header = [str(c).strip() if c is not None else "" for c in rows[0]]
    return header, rows


def find_total_row(rows: list[tuple]) -> tuple | None:
    """找到包含单元格内容为 '总计' 的那一行。"""
    for row in reversed(rows[1:]):
        if any(isinstance(c, str) and c.strip() == "总计" for c in row):
            return row
    return None


def find_column(header: list[str], aliases: list[str]) -> int | None:
    """在表头里按候选名（不区分大小写）查找列下标。"""
    lower_map = {h.lower(): i for i, h in enumerate(header)}
    for alias in aliases:
        key = alias.lower()
        if key in lower_map:
            return lower_map[key]
    return None


# ---------- Bilibili ----------

def read_bilibili_data() -> dict[str, Any]:
    latest_dir = find_latest_dir(BILIBILI_DIR)
    csv_path = latest_dir / "account.csv"

    if not csv_path.is_file():
        raise FileNotFoundError(f"未找到 account.csv: {csv_path}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            reader.fieldnames = [
                name.lstrip("\ufeff") for name in reader.fieldnames
            ]
        rows = list(reader)

    if not rows:
        raise ValueError(f"CSV 没有数据: {csv_path}")

    def parse_row_date(row: dict[str, str]) -> datetime:
        raw = row["时间"].strip()
        for fmt in ("%Y/%m/%d", "%Y-%m-%d"):
            try:
                return datetime.strptime(raw, fmt)
            except ValueError:
                continue
        raise ValueError(f"无法解析日期: {raw!r}")

    latest_row = max(rows, key=parse_row_date)

    result: dict[str, Any] = {"date": latest_dir.name}
    for csv_field, json_field in BILIBILI_FIELD_MAPPING.items():
        if csv_field not in latest_row:
            raise KeyError(f"CSV 缺少字段: {csv_field}")
        result[json_field] = to_int(latest_row[csv_field])

    return result


# ---------- 小红书 ----------

def read_rednote_data() -> dict[str, Any]:
    latest_dir = find_latest_dir(REDNOTE_DIR)

    xlsx_path = None
    for name in ("notes.xlsx", "note.xlsx"):
        candidate = latest_dir / name
        if candidate.is_file():
            xlsx_path = candidate
            break

    if xlsx_path is None:
        raise FileNotFoundError(
            f"未找到 notes.xlsx / note.xlsx: {latest_dir}"
        )

    rows = load_sheet_rows(xlsx_path)
    header = [str(c).strip() if c is not None else "" for c in rows[0]]
    col_index = {name: i for i, name in enumerate(header)}

    note_id_idx = col_index.get("笔记ID", 0)
    total_row = find_total_row(rows)

    def sum_column(idx: int) -> int:
        total = 0
        for row in rows[1:]:
            if row is total_row:
                continue
            if len(row) <= note_id_idx or row[note_id_idx] is None:
                continue
            if idx >= len(row):
                continue
            cell = row[idx]
            if cell is None or isinstance(cell, str):
                continue
            total += cell
        return int(total)

    result: dict[str, Any] = {"date": latest_dir.name}

    for cn, en in REDNOTE_FIELD_MAPPING.items():
        if cn not in col_index:
            result[en] = 0
            continue

        idx = col_index[cn]
        value = None
        if total_row is not None and idx < len(total_row):
            value = total_row[idx]

        # 公式没有缓存值 或 没有"总计"行 -> 自己求和
        if value is None or isinstance(value, str):
            value = sum_column(idx)

        result[en] = to_int(value)

    return result


# ---------- 抖音 ----------

def read_douyin_data() -> dict[str, Any]:
    latest_dir = find_latest_dir(DOUYIN_DIR)
    result: dict[str, Any] = {"date": latest_dir.name}

    # --- videos.xlsx ---
    videos_path = latest_dir / "videos.xlsx"
    if not videos_path.is_file():
        raise FileNotFoundError(f"未找到 videos.xlsx: {videos_path}")

    v_rows = load_sheet_rows(videos_path)
    v_header = [str(c).strip() if c is not None else "" for c in v_rows[0]]
    v_index = {name: i for i, name in enumerate(v_header)}
    v_total_row = find_total_row(v_rows)

    if v_total_row is None:
        raise ValueError(f"videos.xlsx 中未找到'总计'行: {videos_path}")

    for cn, en in DOUYIN_VIDEO_FIELD_MAPPING.items():
        if cn not in v_index:
            result[en] = 0
            continue
        idx = v_index[cn]
        value = v_total_row[idx] if idx < len(v_total_row) else None
        result[en] = to_int(value)

    # --- fans.xlsx ---
    fans_path = latest_dir / "fans.xlsx"
    if not fans_path.is_file():
        raise FileNotFoundError(f"未找到 fans.xlsx: {fans_path}")

    f_rows = load_sheet_rows(fans_path)
    f_header = [str(c).strip() if c is not None else "" for c in f_rows[0]]
    f_index = {name: i for i, name in enumerate(f_header)}

    if "总粉丝量" not in f_index or "日期" not in f_index:
        raise KeyError(f"fans.xlsx 缺少'日期'或'总粉丝量'列: {fans_path}")

    date_idx = f_index["日期"]
    fans_idx = f_index["总粉丝量"]

    def to_date(value: Any):
        if isinstance(value, datetime):
            return value.date()
        if hasattr(value, "year") and hasattr(value, "month") and hasattr(value, "day"):
            return value
        text = str(value).strip()
        for fmt in ("%Y-%m-%d", "%Y/%m/%d"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
        return None

    latest_fans_row = None
    latest_fans_date = None
    for row in f_rows[1:]:
        if len(row) <= date_idx or row[date_idx] is None:
            continue
        row_date = to_date(row[date_idx])
        if row_date is None:
            continue
        if latest_fans_date is None or row_date > latest_fans_date:
            latest_fans_date = row_date
            latest_fans_row = row

    if latest_fans_row is None:
        result["fans"] = 0
    else:
        value = (
            latest_fans_row[fans_idx]
            if fans_idx < len(latest_fans_row)
            else None
        )
        result["fans"] = to_int(value)

    return result


# ---------- 快手 ----------

def read_kuaishou_data() -> dict[str, Any]:
    latest_dir = find_latest_dir(KUAISHOU_DIR)

    videos_path = None
    for name in ("videos.xlsx", "videos.csv"):
        candidate = latest_dir / name
        if candidate.is_file():
            videos_path = candidate
            break

    if videos_path is None:
        raise FileNotFoundError(
            f"未找到 videos.xlsx / videos.csv: {latest_dir}"
        )

    header, rows = load_table(videos_path)
    total_row = find_total_row(rows)

    if total_row is None:
        raise ValueError(f"未找到'总计'行: {videos_path}")

    result: dict[str, Any] = {"date": latest_dir.name}

    for out_field, aliases in KUAISHOU_COLUMN_ALIASES.items():
        idx = find_column(header, aliases)

        # 找不到列名时，fans 兜底取最后一列
        if idx is None and out_field == "fans":
            idx = len(header) - 1

        if idx is None or idx >= len(total_row):
            result[out_field] = 0
            continue

        result[out_field] = to_int(total_row[idx])

    return result


# ---------- YouTube ----------

def read_youtube_data() -> dict[str, Any]:
    latest_dir = find_latest_dir(YOUTUBE_DIR)
    csv_path = latest_dir / "videos.csv"

    if not csv_path.is_file():
        raise FileNotFoundError(f"未找到 videos.csv: {csv_path}")

    rows = load_csv_rows(csv_path)

    if len(rows) < 2:
        raise ValueError(f"videos.csv 不足两行，没有 Total 行: {csv_path}")

    header = [str(c).strip() if c is not None else "" for c in rows[0]]
    total_row = rows[1]  # 第二行就是 Total 行

    result: dict[str, Any] = {"date": latest_dir.name}
    for out_field, aliases in YOUTUBE_COLUMN_ALIASES.items():
        idx = find_column(header, aliases)
        if idx is None or idx >= len(total_row):
            result[out_field] = 0
            continue
        result[out_field] = to_int(total_row[idx])

    return result


# ---------- TikTok ----------

def read_tiktok_data() -> dict[str, Any]:
    """读取 data/TikTok 下最晚日期文件夹中的 videos.xlsx（最后一行总计）。"""
    latest_dir = find_latest_dir(TIKTOK_DIR)
    xlsx_path = latest_dir / "videos.xlsx"

    if not xlsx_path.is_file():
        raise FileNotFoundError(f"未找到 videos.xlsx: {xlsx_path}")

    rows = load_sheet_rows(xlsx_path)
    header = [str(c).strip() if c is not None else "" for c in rows[0]]

    # 最后一行是总计行
    total_row = rows[-1]

    def is_video_id(value: Any) -> bool:
        if value is None:
            return False
        return str(value).strip().isdigit()

    def sum_column(idx: int) -> int:
        total = 0
        for row in rows[1:]:
            if row is total_row:
                continue
            if not row or not is_video_id(row[0]):
                continue
            if idx >= len(row):
                continue
            cell = row[idx]
            if cell is None or isinstance(cell, str):
                continue
            total += cell
        return int(total)

    result: dict[str, Any] = {"date": latest_dir.name}

    for out_field, aliases in TIKTOK_COLUMN_ALIASES.items():
        idx = find_column(header, aliases)

        # 找不到列名时，fans 兜底取最后一列
        if idx is None and out_field == "fans":
            idx = len(header) - 1

        if idx is None:
            result[out_field] = 0
            continue

        value = total_row[idx] if idx < len(total_row) else None

        # 公式没有缓存值（None 或字符串）-> 自己求和
        if value is None or isinstance(value, str):
            value = sum_column(idx)

        result[out_field] = to_int(value)

    return result


# ---------- Instagram ----------

def read_instagram_data() -> dict[str, Any]:
    """读取 data/Instagram 下最晚日期文件夹中的 videos.csv（最后一行 All 行）。"""
    latest_dir = find_latest_dir(INSTAGRAM_DIR)
    csv_path = latest_dir / "videos.csv"

    if not csv_path.is_file():
        raise FileNotFoundError(f"未找到 videos.csv: {csv_path}")

    rows = load_csv_rows(csv_path)
    if len(rows) < 2:
        raise ValueError(f"videos.csv 数据不足: {csv_path}")

    header = [str(c).strip() if c is not None else "" for c in rows[0]]
    total_row = rows[-1]  # 最后一行（All 行）

    result: dict[str, Any] = {"date": latest_dir.name}

    for out_field, aliases in INSTAGRAM_COLUMN_ALIASES.items():
        idx = find_column(header, aliases)
        if idx is None or idx >= len(total_row):
            result[out_field] = 0
            continue
        result[out_field] = to_int(total_row[idx])

    return result


# ---------- 汇总 ----------

# 参与"互动量"统计的字段（平台中不存在则按 0 处理）
ENGAGEMENT_FIELDS = ("likes", "saves", "coins", "comments", "danmakus", "shares")

# 各平台视频明细表的统一读取规则。id_aliases 用来识别真实视频行，避免把
# Bilibili / YouTube 等表格末尾已有的分类汇总行再次计入。
VIDEO_SOURCE_SPECS = (
    {
        "key": "bilibili",
        "root": BILIBILI_DIR,
        "filenames": ("videos.csv",),
        "id_aliases": ("bvid",),
        "title_aliases": ("title",),
        "fields": {
            "views": ("view", "views"),
            "likes": ("like", "likes"),
            "saves": ("favorite", "favorites"),
            "coins": ("coin", "coins"),
            "comments": ("reply", "replies", "comments"),
            "danmakus": ("danmaku", "danmakus"),
            "shares": ("share", "shares"),
        },
    },
    {
        "key": "rednote",
        "root": REDNOTE_DIR,
        "filenames": ("notes.xlsx", "note.xlsx"),
        "id_aliases": ("笔记ID",),
        "title_aliases": ("标题",),
        "fields": {
            "views": ("浏览量",),
            "likes": ("点赞量",),
            "saves": ("收藏量",),
            "comments": ("评论数",),
            "shares": ("转发数",),
        },
    },
    {
        "key": "douyin",
        "root": DOUYIN_DIR,
        "filenames": ("videos.xlsx",),
        "id_aliases": ("发布时间",),
        "title_aliases": ("作品名称",),
        "fields": {
            "views": ("播放量",),
            "likes": ("点赞量",),
            "saves": ("收藏量",),
            "comments": ("评论量",),
            "shares": ("分享量",),
        },
    },
    {
        "key": "kuaishou",
        "root": KUAISHOU_DIR,
        "filenames": ("videos.xlsx", "videos.csv"),
        "id_aliases": ("发布时间",),
        "title_aliases": ("作品标题",),
        "fields": {
            "views": ("播放量",),
            "likes": ("点赞量",),
            "saves": ("收藏量",),
            "comments": ("评论量",),
            "shares": ("转发量", "分享量"),
        },
    },
    {
        "key": "youtube",
        "root": YOUTUBE_DIR,
        "filenames": ("videos.csv",),
        "id_aliases": ("Content",),
        "title_aliases": ("Video title",),
        "fields": {
            "views": ("Views",),
            "likes": ("Likes",),
            "comments": ("Comments added", "Comments"),
            "shares": ("Shares",),
        },
    },
    {
        "key": "tiktok",
        "root": TIKTOK_DIR,
        "filenames": ("videos.xlsx",),
        "id_aliases": ("视频ID",),
        "title_aliases": ("视频描述",),
        "fields": {
            "views": ("播放量",),
            "likes": ("点赞量",),
            "saves": ("收藏量",),
            "comments": ("评论量",),
            "shares": ("分享量",),
        },
    },
    {
        "key": "instagram",
        "root": INSTAGRAM_DIR,
        "filenames": ("videos.csv",),
        "id_aliases": ("shortcode",),
        "title_aliases": ("caption",),
        "fields": {
            "views": ("views",),
            "likes": ("likes",),
            "comments": ("comments",),
            "shares": ("shares",),
        },
    },
)

# 爆款作品检索条件。表达式语法：& 表示“且”，| 表示“或”，括号控制优先级。
VIRAL_WORK_QUERIES = {
    "brat_remake": {
        "title": "BRAT 编曲还原",
        "query": "360 & (remake | 还原)",
    },
    "apple_music_animated_cover_ep1": {
        "title": "Apple Music 动态封面 Ep1",
        "query": "Apple Music & (Ep 1 | Ep. 1 | Ep1)",
    },
    "apple_music_ai_cover": {
        "title": "Apple Music AI 封面",
        "query": "Apple Music & AI",
    },
    "apple_music_artist_page_1": {
        "title": "Apple Music 歌手页面 1",
        "query": "Apple Music & (歌手新页面1 | 歌手新页面集合1 | New Artist Page 1)",
    },
    "apple_music_classical_artist_page": {
        "title": "Apple Music 音乐家页面",
        "query": "Apple Music & (音乐家 | Classical)",
    },
}


def tokenize_search_expression(expression: str) -> list[str]:
    """把检索表达式拆成关键词、运算符与括号。"""
    tokens: list[str] = []
    buffer: list[str] = []

    def flush_keyword() -> None:
        keyword = "".join(buffer).strip()
        buffer.clear()
        if keyword:
            tokens.append(keyword)

    for char in expression:
        if char in "&|()":
            flush_keyword()
            tokens.append(char)
        else:
            buffer.append(char)
    flush_keyword()

    if not tokens:
        raise ValueError("检索表达式不能为空")
    return tokens


def parse_search_expression(expression: str) -> tuple:
    """解析布尔检索表达式；& 的优先级高于 |，括号可覆盖优先级。"""
    tokens = tokenize_search_expression(expression)
    position = 0

    def parse_or() -> tuple:
        nonlocal position
        node = parse_and()
        while position < len(tokens) and tokens[position] == "|":
            position += 1
            node = ("or", node, parse_and())
        return node

    def parse_and() -> tuple:
        nonlocal position
        node = parse_primary()
        while position < len(tokens) and tokens[position] == "&":
            position += 1
            node = ("and", node, parse_primary())
        return node

    def parse_primary() -> tuple:
        nonlocal position
        if position >= len(tokens):
            raise ValueError(f"检索表达式不完整: {expression!r}")

        token = tokens[position]
        if token == "(":
            position += 1
            node = parse_or()
            if position >= len(tokens) or tokens[position] != ")":
                raise ValueError(f"检索表达式缺少右括号: {expression!r}")
            position += 1
            return node
        if token in ("&", "|", ")"):
            raise ValueError(f"检索表达式中的运算符位置无效: {expression!r}")

        position += 1
        return ("term", token)

    tree = parse_or()
    if position != len(tokens):
        raise ValueError(
            f"检索表达式存在无法解析的内容 {tokens[position]!r}: {expression!r}"
        )
    return tree


def normalize_search_text(text: str) -> str:
    """统一全半角、大小写与空白，供标题检索使用。"""
    normalized = unicodedata.normalize("NFKC", text).casefold()
    return " ".join(normalized.split())


def keyword_matches(title: str, keyword: str) -> bool:
    """匹配单个关键词；英文/数字边缘使用词边界，避免 AI 命中 Taylor。"""
    normalized_title = normalize_search_text(title)
    normalized_keyword = normalize_search_text(keyword)
    if not normalized_keyword:
        return False

    pattern = re.escape(normalized_keyword)
    if normalized_keyword[0].isascii() and normalized_keyword[0].isalnum():
        pattern = rf"(?<![0-9a-z]){pattern}"
    if normalized_keyword[-1].isascii() and normalized_keyword[-1].isalnum():
        pattern = rf"{pattern}(?![0-9a-z])"
    return re.search(pattern, normalized_title) is not None


def matches_search_expression(title: str, parsed_expression: tuple) -> bool:
    """判断标题是否满足已解析的检索表达式。"""
    operator = parsed_expression[0]
    if operator == "term":
        return keyword_matches(title, parsed_expression[1])
    if operator == "and":
        return (
            matches_search_expression(title, parsed_expression[1])
            and matches_search_expression(title, parsed_expression[2])
        )
    if operator == "or":
        return (
            matches_search_expression(title, parsed_expression[1])
            or matches_search_expression(title, parsed_expression[2])
        )
    raise ValueError(f"未知检索运算符: {operator!r}")


def empty_content_metrics() -> dict[str, int]:
    """创建字段完整的内容系列统计结果。"""
    return {
        "views": 0,
        "likes": 0,
        "saves": 0,
        "coins": 0,
        "comments": 0,
        "danmakus": 0,
        "shares": 0,
        "engagement": 0,
    }


def find_source_file(latest_dir: Path, filenames: tuple[str, ...]) -> Path:
    """从候选文件名中找到平台视频明细表。"""
    for filename in filenames:
        candidate = latest_dir / filename
        if candidate.is_file():
            return candidate
    raise FileNotFoundError(
        f"未找到视频明细文件 {filenames}: {latest_dir}"
    )


def read_bilibili_video_count() -> int:
    """按最新视频明细中的唯一 BVID 统计期数，排除分类汇总行。"""
    latest_dir = find_latest_dir(BILIBILI_DIR)
    header, rows = load_table(latest_dir / "videos.csv")
    id_idx = find_column(header, ["bvid"])
    if id_idx is None:
        raise KeyError("哔哩哔哩视频明细缺少 bvid 列")
    video_ids = {
        str(row[id_idx]).strip()
        for row in rows[1:]
        if id_idx < len(row) and row[id_idx] is not None
        and re.fullmatch(r"BV[0-9A-Za-z]+", str(row[id_idx]).strip())
    }
    return len(video_ids)


def build_content_series() -> dict[str, dict[str, int]]:
    """逐条扫描各平台视频明细，重新计算指定内容系列的数据。"""
    series_keywords = {
        "apple_music": ("apple music",),
        "remake": ("还原", "remake"),
    }
    results = {
        name: empty_content_metrics() for name in series_keywords
    }

    for spec in VIDEO_SOURCE_SPECS:
        latest_dir = find_latest_dir(spec["root"])
        source_path = find_source_file(latest_dir, spec["filenames"])
        header, rows = load_table(source_path)

        id_idx = find_column(header, list(spec["id_aliases"]))
        title_idx = find_column(header, list(spec["title_aliases"]))
        if id_idx is None or title_idx is None:
            raise KeyError(
                f"视频明细缺少 ID 或标题列: {source_path}"
            )

        field_indexes = {
            field: find_column(header, list(aliases))
            for field, aliases in spec["fields"].items()
        }

        for row in rows[1:]:
            if id_idx >= len(row) or title_idx >= len(row):
                continue

            video_id = str(row[id_idx]).strip() if row[id_idx] is not None else ""
            title = str(row[title_idx]).strip() if row[title_idx] is not None else ""
            if not video_id or not title:
                continue

            normalized_title = title.casefold()
            for series_name, keywords in series_keywords.items():
                if not any(keyword in normalized_title for keyword in keywords):
                    continue

                result = results[series_name]
                for field, idx in field_indexes.items():
                    if idx is not None and idx < len(row):
                        result[field] += to_int(row[idx])

    for result in results.values():
        result["engagement"] = sum(
            result[field] for field in ENGAGEMENT_FIELDS
        )

    return results


def build_viral_rate() -> dict[str, Any]:
    """按全平台视频播放量中位数的 2 倍计算爆款率。"""
    video_views: list[int] = []

    for spec in VIDEO_SOURCE_SPECS:
        latest_dir = find_latest_dir(spec["root"])
        source_path = find_source_file(latest_dir, spec["filenames"])
        header, rows = load_table(source_path)

        id_idx = find_column(header, list(spec["id_aliases"]))
        title_idx = find_column(header, list(spec["title_aliases"]))
        views_idx = find_column(header, list(spec["fields"]["views"]))
        if id_idx is None or title_idx is None or views_idx is None:
            raise KeyError(
                f"视频明细缺少 ID、标题或播放量列: {source_path}"
            )

        for row in rows[1:]:
            if max(id_idx, title_idx, views_idx) >= len(row):
                continue

            video_id = str(row[id_idx]).strip() if row[id_idx] is not None else ""
            title = str(row[title_idx]).strip() if row[title_idx] is not None else ""
            if not video_id or not title:
                continue

            video_views.append(to_int(row[views_idx]))

    if not video_views:
        return {
            "definition": "views >= median_views * 2",
            "video_count": 0,
            "median_views": 0,
            "threshold_views": 0,
            "viral_video_count": 0,
            "rate": 0.0,
        }

    median_views = median(video_views)
    threshold_views = median_views * 2
    viral_video_count = sum(
        views >= threshold_views for views in video_views
    )

    return {
        "definition": "views >= median_views * 2",
        "video_count": len(video_views),
        "median_views": median_views,
        "threshold_views": threshold_views,
        "viral_video_count": viral_video_count,
        "rate": round(viral_video_count / len(video_views) * 100, 2),
    }


def build_viral_works() -> dict[str, dict[str, Any]]:
    """按布尔检索表达式聚合每个爆款作品在各平台的视频数据。"""
    parsed_queries = {
        key: parse_search_expression(config["query"])
        for key, config in VIRAL_WORK_QUERIES.items()
    }
    results: dict[str, dict[str, Any]] = {}
    for key, config in VIRAL_WORK_QUERIES.items():
        results[key] = {
            "title": config["title"],
            "query": config["query"],
            "matched_posts": 0,
            **empty_content_metrics(),
            "platforms": {},
        }

    for spec in VIDEO_SOURCE_SPECS:
        latest_dir = find_latest_dir(spec["root"])
        source_path = find_source_file(latest_dir, spec["filenames"])
        header, rows = load_table(source_path)

        id_idx = find_column(header, list(spec["id_aliases"]))
        title_idx = find_column(header, list(spec["title_aliases"]))
        if id_idx is None or title_idx is None:
            raise KeyError(f"视频明细缺少 ID 或标题列: {source_path}")

        field_indexes = {
            field: find_column(header, list(aliases))
            for field, aliases in spec["fields"].items()
        }

        for row in rows[1:]:
            if id_idx >= len(row) or title_idx >= len(row):
                continue

            video_id = str(row[id_idx]).strip() if row[id_idx] is not None else ""
            title = str(row[title_idx]).strip() if row[title_idx] is not None else ""
            if not video_id or not title:
                continue

            for work_key, parsed_query in parsed_queries.items():
                if not matches_search_expression(title, parsed_query):
                    continue

                result = results[work_key]
                platform_result = result["platforms"].setdefault(
                    spec["key"],
                    {
                        "date": latest_dir.name,
                        "matched_posts": 0,
                        **empty_content_metrics(),
                    },
                )
                result["matched_posts"] += 1
                platform_result["matched_posts"] += 1

                for field, idx in field_indexes.items():
                    if idx is None or idx >= len(row):
                        continue
                    value = to_int(row[idx])
                    result[field] += value
                    platform_result[field] += value

    for result in results.values():
        result["engagement"] = sum(
            result[field] for field in ENGAGEMENT_FIELDS
        )
        result["engagement_rate"] = round(
            result["engagement"] / result["views"] * 100, 2
        ) if result["views"] else 0.0
        for platform_result in result["platforms"].values():
            platform_result["engagement"] = sum(
                platform_result[field] for field in ENGAGEMENT_FIELDS
            )
            platform_result["engagement_rate"] = round(
                platform_result["engagement"] / platform_result["views"] * 100,
                2,
            ) if platform_result["views"] else 0.0

    return results


def build_total(platform_data: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """对所有平台的同名字段求和。

    - 只出现在单个平台的字段（如 bilibili 的 coins、danmakus）也会保留；
    - 额外输出 engagement：likes/saves/coins/comments/danmakus/shares 之和。
    """
    total: dict[str, Any] = {}

    for item in platform_data.values():
        for field, value in item.items():
            if field == "date":
                continue
            total[field] = total.get(field, 0) + to_int(value)

    # 保证所有互动字段都存在（某些平台可能完全没有该字段）
    for field in ENGAGEMENT_FIELDS:
        total.setdefault(field, 0)

    total["engagement"] = sum(total[field] for field in ENGAGEMENT_FIELDS)
    return total


# ---------- 入口 ----------

def main() -> None:
    platform_data = {
        "bilibili": read_bilibili_data(),
        "rednote": read_rednote_data(),
        "douyin": read_douyin_data(),
        "kuaishou": read_kuaishou_data(),
        "youtube": read_youtube_data(),
        "tiktok": read_tiktok_data(),
        "instagram": read_instagram_data(),
    }

    data: dict[str, Any] = dict(platform_data)
    data["bilibili"]["video_count"] = read_bilibili_video_count()
    data.update(build_content_series())
    data["viral_rate"] = build_viral_rate()
    data["viral_works"] = build_viral_works()
    data["total"] = build_total(platform_data)

    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

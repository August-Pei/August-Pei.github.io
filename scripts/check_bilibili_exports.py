#!/usr/bin/env python3
"""检查 Bilibili 最新日期目录中的 CSV，不访问网络或修改文件。"""
import argparse
import csv
import json
import math
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / 'data' / 'bilibili'
VIDEO_HEADER = ['bvid', 'title', 'published_at', 'url', 'view', 'like', 'coin', 'favorite', 'share', 'danmaku', 'reply']
METRICS = ['播放量', '空间访客', '净增粉丝', '点赞', '收藏', '硬币', '评论', '弹幕', '分享']
ACCOUNT_HEADER = ['时间'] + [column for metric in METRICS for column in (metric, metric + '累计')]


def inspect(folder, name, since):
    file = folder / name
    result = {'name': name, 'exists': file.is_file(), 'valid': False, 'rows': 0, 'path': str(file)}
    if not result['exists']:
        return {**result, 'message': '文件不存在'}
    try:
        stat = file.stat()
        result.update(bytes=stat.st_size, modifiedAt=stat.st_mtime * 1000, fresh=not since or stat.st_mtime * 1000 >= since)
        with file.open(encoding='utf-8-sig', newline='') as handle:
            rows = list(csv.reader(handle, strict=True))
        expected = VIDEO_HEADER if name == 'videos.csv' else ACCOUNT_HEADER
        if not rows or rows[0] != expected:
            raise ValueError('CSV 表头与采集脚本格式不一致')
        data = rows[1:]
        result['rows'] = len(data)
        if not data:
            raise ValueError('CSV 只有表头，没有数据')
        for row in data:
            if len(row) != len(expected):
                raise ValueError('存在列数不一致的数据行')
            for value in row[4:] if name == 'videos.csv' else row[1:]:
                if value and (not math.isfinite(float(value)) or not float(value).is_integer()):
                    raise ValueError('统计字段包含非整数值')
            if name == 'account.csv':
                date.fromisoformat(row[0].replace('/', '-'))
        if name == 'videos.csv' and not any(re.fullmatch(r'BV[0-9A-Za-z]+', row[0]) for row in data):
            raise ValueError('缺少有效 BVID 的视频明细')
        if not result['fresh']:
            raise ValueError('文件来自此前采集，本次未更新')
        result.update(valid=True, message='表头、数据行及统计字段正常' + ('，本次已更新' if since else ''))
    except (OSError, UnicodeError, csv.Error, ValueError) as error:
        result['message'] = str(error)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--since', type=float, default=0)
    args = parser.parse_args()
    folders = []
    if ROOT.exists():
        for folder in ROOT.iterdir():
            if folder.is_dir() and re.fullmatch(r'\d{4}-\d{2}-\d{2}', folder.name):
                try:
                    date.fromisoformat(folder.name)
                    folders.append(folder)
                except ValueError:
                    pass
    latest = max(folders, key=lambda folder: folder.name) if folders else None
    files = [inspect(latest, name, args.since) for name in ('account.csv', 'videos.csv')] if latest else []
    print(json.dumps({'date': latest.name if latest else None, 'directory': str(latest) if latest else str(ROOT), 'files': files, 'valid': bool(files) and all(file['valid'] for file in files)}, ensure_ascii=False))


if __name__ == '__main__':
    main()

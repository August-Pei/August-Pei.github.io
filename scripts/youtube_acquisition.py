#!/usr/bin/env python3
"""从 Downloads 导入 YouTube 导出 ZIP，发布两份 CSV 后清理压缩文件。"""
import argparse
import csv
from datetime import date
import json
import math
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import sys
from uuid import uuid4
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/YouTube'
DOWNLOADS = Path('/Users/pyh/Downloads')
ARCHIVE_PATTERN = re.compile(r'^内容 \d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2} .+\.zip$', re.IGNORECASE)
REQUIRED = {
    'videos': [
        ('views', 'view', '播放量', '观看次数'),
        ('subscribers', 'subscriber', 'fans', '订阅者', '订阅数', '订阅量'),
        ('likes', 'like', '点赞量', '点赞'),
        ('shares', 'share', '分享量', '分享', '转发量'),
        ('comments added', 'comments', 'comment', '评论量', '评论'),
    ],
    'account': [('date', '日期', '时间'), ('subscribers gained', 'net subscribers', '粉丝净增', '净增粉丝'), ('views', 'view', '播放量', '观看次数')],
}


def inspect(file, kind):
    with file.open(encoding='utf-8-sig', newline='') as handle:
        rows = list(csv.reader(handle, strict=True))
    while rows and not any(rows[-1]):
        rows.pop()
    if len(rows) < 2:
        raise ValueError(f'{file.name} 没有数据')
    header = [value.strip().lower() for value in rows[0]]
    columns = []
    for aliases in REQUIRED[kind]:
        matches = [i for i, value in enumerate(header) if value in aliases]
        if not matches:
            raise ValueError(f'{file.name} 缺少 {aliases[0]} 指标，请检查高级模式中的导出设置')
        columns.append(matches[0])
    if any(len(row) != len(header) for row in rows[1:]):
        raise ValueError(f'{file.name} 存在列数与表头不一致的数据行')
    if kind == 'videos':
        if not any(value.strip().lower() in ('total', '总计', '合计') for value in rows[1]):
            raise ValueError('表格数据 CSV 的第二行必须为 Total / 总计，才能供网站汇总读取')
        for column in columns:
            value = rows[1][column].strip().replace(',', '')
            if not value or not math.isfinite(float(value)):
                raise ValueError('表格数据的总计行存在缺失或无效指标')
    else:
        data_rows = [row for row in rows[1:] if row[columns[0]].strip().lower() not in ('', 'total', '总计', '合计')]
        if not data_rows:
            raise ValueError('总计 CSV 缺少按日期排列的数据')
        for row in data_rows:
            for column in columns[1:]:
                value = row[column].strip().replace(',', '')
                if not value or not math.isfinite(float(value)):
                    raise ValueError('总计 CSV 的每日指标为空或不是有效数值')
    return {'rows': len(rows) - 1, 'bytes': file.stat().st_size}


def check_folder(folder):
    files = []
    for kind in ('videos', 'account'):
        file = folder / f'{kind}.csv'
        item = {'name': file.name, 'exists': file.is_file(), 'valid': False}
        try:
            if not item['exists']:
                raise ValueError('文件不存在')
            item.update(inspect(file, kind))
            item.update(valid=True, message='CSV 可以读取，所需指标及数据行存在')
        except Exception as error:
            item['message'] = str(error)
        files.append(item)
    return {'date': folder.name, 'directory': str(folder), 'files': files, 'valid': all(file['valid'] for file in files)}


def check():
    folders = []
    if DATA.exists():
        for folder in DATA.iterdir():
            try:
                if folder.is_dir() and date.fromisoformat(folder.name).isoformat() == folder.name:
                    folders.append(folder)
            except ValueError:
                pass
    if not folders:
        return {'date': None, 'directory': str(DATA), 'files': [], 'valid': False}
    return check_folder(max(folders, key=lambda folder: folder.name))


def import_archive(folder, name):
    if not ARCHIVE_PATTERN.fullmatch(name) or Path(name).name != name:
        raise ValueError('请选择匹配「内容 起始日期_结束日期 频道名.zip」的下载文件')
    source = DOWNLOADS / name
    if source.is_symlink() or not source.is_file() or source.resolve().parent != DOWNLOADS.resolve():
        raise ValueError('下载文件不存在或不是 Downloads 中的普通文件，请刷新列表')
    archive = folder / name
    if archive.exists():
        raise ValueError('当天目录已存在同名 ZIP，请先处理该文件再重试')
    extraction = folder / Path(name).stem
    if extraction.exists():
        raise ValueError('当天目录已有同名解压文件夹，请先处理该文件夹后重试')
    # Inspect the archive before moving the user's download.
    with ZipFile(source) as zipped:
        entries = zipped.infolist()
        if len(entries) > 1000 or sum(info.file_size for info in entries) > 128 * 1024 * 1024:
            raise ValueError('压缩包超出 YouTube 数据导入大小限制')
        selected = {}
        aliases = {'表格数据.csv': 'videos', 'table data.csv': 'videos', '总计.csv': 'account', 'totals.csv': 'account'}
        for info in entries:
            route = PurePosixPath(info.filename)
            if route.is_absolute() or '..' in route.parts or '\\' in info.filename or stat.S_ISLNK(info.external_attr >> 16) or info.flag_bits & 1:
                raise ValueError('压缩包包含不支持的路径、链接或加密文件')
            if info.is_dir() or '__MACOSX' in route.parts or route.name.startswith('._'):
                continue
            kind = aliases.get(route.name.lower())
            if kind:
                if kind in selected:
                    raise ValueError(f'压缩包包含多份 {kind} 候选文件，无法确定导入哪一份')
                selected[kind] = info
        if set(selected) != {'videos', 'account'}:
            raise ValueError('ZIP 中缺少「表格数据.csv」或「总计.csv」，请重新下载高级模式的 CSV 导出包')
    backup_dir = ROOT / 'data/admin-backups/YouTube' / folder.name / uuid4().hex
    previous = {}
    published = []
    moved = False
    committed = False
    logs = []
    try:
        source.rename(archive)
        moved = True
        logs.append(f'已移动 ZIP：Downloads/{name} → {folder.name}/{name}')
        extraction.mkdir()
        with ZipFile(archive) as zipped:
            # Extract only the two requested exports into the owned temporary directory.
            for kind, info in selected.items():
                destination = extraction / f'{kind}.csv'
                with zipped.open(info.filename) as incoming, destination.open('xb') as outgoing:
                    shutil.copyfileobj(incoming, outgoing)
                inspect(destination, kind)
                logs.append(f'{PurePosixPath(info.filename).name} → {kind}.csv')
        for kind in ('videos', 'account'):
            target = folder / f'{kind}.csv'
            if target.exists():
                if not target.is_file() or target.is_symlink():
                    raise ValueError(f'{target.name} 不是普通文件')
                backup_dir.mkdir(parents=True, exist_ok=True)
                backup_file = backup_dir / target.name
                shutil.copy2(target, backup_file)
                previous[kind] = backup_file
            else:
                previous[kind] = None
        for kind in ('videos', 'account'):
            os.replace(extraction / f'{kind}.csv', folder / f'{kind}.csv')
            published.append(kind)
        checked = check_folder(folder)
        if not checked['valid']:
            raise ValueError('导入后的 CSV 文件检查失败')
        committed = True
        logs.append('videos.csv 和 account.csv 已移动到当天目录，所需指标检查通过。')
        if backup_dir.exists():
            logs.append(f'旧 CSV 已备份：{backup_dir}')
        shutil.rmtree(extraction)
        archive.unlink()
        logs.append('已删除导入的 ZIP 和本次解压文件夹，Downloads 中的原 ZIP 已移走。')
        return {'logs': logs, 'check': checked}
    except Exception as error:
        if committed:
            raise ValueError(f'两份 CSV 已成功导入，但清理 ZIP / 解压目录失败：{error}；请处理当天目录中的残留文件') from error
        for kind in reversed(published):
            target = folder / f'{kind}.csv'
            if previous[kind] is None:
                target.unlink(missing_ok=True)
            else:
                shutil.copy2(previous[kind], target)
        if extraction.exists():
            shutil.rmtree(extraction)
        if moved and archive.exists():
            if source.exists():
                raise ValueError(f'导入失败，下载位置已出现同名文件，原 ZIP 保留在 {archive}：{error}') from error
            archive.rename(source)
        raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=('check', 'import'))
    parser.add_argument('--date')
    parser.add_argument('--archive')
    args = parser.parse_args()
    try:
        if args.action == 'check':
            result = check()
        else:
            if not args.date or date.fromisoformat(args.date).isoformat() != args.date:
                raise ValueError('日期格式不正确')
            folder = DATA / args.date
            if not folder.is_dir():
                raise ValueError('请先创建当天目录')
            result = import_archive(folder, args.archive or '')
        print(json.dumps(result, ensure_ascii=False))
    except Exception as error:
        print(json.dumps({'error': str(error)}, ensure_ascii=False))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())

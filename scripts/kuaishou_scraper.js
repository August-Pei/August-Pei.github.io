(function scrapeKuaishouWithDashTitles() {
    // 1. 查找所有包含“已发布”文本的底层节点
    const timeNodes = Array.from(document.querySelectorAll('*')).filter(el => 
        el.children.length === 0 && el.textContent.includes('已发布')
    );

    if (timeNodes.length === 0) {
        console.error("❌ 未检测到作品列表！请确认处于【作品管理】页面且已加载内容。");
        return;
    }

    const list = [];

    timeNodes.forEach((timeNode, idx) => {
        // 向上定位独立的作品卡片容器
        let card = timeNode;
        while (card && card.parentElement && card.parentElement.tagName !== 'BODY') {
            if (card.parentElement.innerText.split('已发布').length > 2) {
                break;
            }
            card = card.parentElement;
        }

        if (!card) return;

        // 获取卡片内所有非空文本行
        const rawLines = card.innerText.split('\n').map(s => s.trim()).filter(Boolean);

        // 提取发布时间
        const pubTime = rawLines.find(l => l.includes('已发布')) || "未知时间";

        // 提取数据指标（数字、含千分位逗号或带单位的数值）
        const metrics = rawLines.filter(l => /^[\d,]+(\.\d+)?[wW万]?$/.test(l));

        // 排除规则：时间、数据、视频时长(如03:39)、常见平台标签(如流量助推)
        const isNonTitle = (line) => {
            if (line.includes('已发布')) return true;
            if (/^[\d,]+(\.\d+)?[wW万]?$/.test(line)) return true;
            if (/^\d{1,2}:\d{2}$/.test(line)) return true;
            if (/^(流量助推|审核中|已下架|未通过)$/.test(line)) return true;
            return false;
        };

        // 过滤出候选标题（即便只有 "-" 也会被完整保留）
        const titleCandidates = rawLines.filter(line => !isNonTitle(line));
        const title = titleCandidates.length > 0 ? titleCandidates[0] : "-";

        list.push({
            "idx": idx,
            "作品标题": title,
            "发布时间": pubTime,
            "播放量": metrics[0] || "0",
            "评论量": metrics[1] || "0",
            "点赞量": metrics[2] || "0"
        });
    });

    // 防止同名/符号标题在去重时被误删，结合索引做唯一区分
    const uniqueList = Array.from(
        new Map(list.map(item => [item['作品标题'] + '_' + item['发布时间'] + '_' + item['idx'], item])).values()
    ).map(({ idx, ...rest }) => rest);

    // 预览输出
    console.log(`✅ 抓取完成！共提取 ${uniqueList.length} 条作品数据（含标题为 "-" 的视频）：`);
    console.table(uniqueList);

    // 导出 CSV 文件
    if (uniqueList.length > 0) {
        const headers = ["作品标题", "发布时间", "播放量", "评论量", "点赞量"];
        const csvRows = [headers.join(",")];
        uniqueList.forEach(item => {
            csvRows.push(headers.map(h => `"${(item[h] || '').replace(/"/g, '""')}"`).join(","));
        });
        const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `videos.csv`;
        link.click();
    }
})();
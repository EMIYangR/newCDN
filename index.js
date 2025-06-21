import { dataArray } from 'https://cdn.jsdmirror.com/gh/EMIYangR/newCDN/data.js';

$(document).ready(function () {
    getPrint();
    // 监听每个游戏列表的点击事件
    $(document).on('click', '#every-game-list li', function () {
        if (typeof getPrint === 'function') {
            setTimeout(getPrint, 1500); // 增加1.5s延时确保页面刷新了内容
        }
    });
});

// 提取所有banbp5下img的alt值（左右两边可能有多个）
function getBans() {
    const getAlts = selector =>
        Array.from(document.querySelectorAll(selector)).flatMap(banbp5 =>
            Array.from(banbp5.querySelectorAll('img')).map(img => img.alt)
        );
    return {
        leftAlts: getAlts('.gradual-left .banbp5'),
        rightAlts: getAlts('.gradual-right .banbp5')
    };
}

// 提取所有tb-box types-show-box下c-img的第一个img链接最后一部分，若长度大于8则舍去
function getPicksBySide() {
    return Array.from(document.querySelectorAll('.tb-box.types-show-box .c-img img:first-child'))
        .map(img => {
            const filename = img.src.split('/').pop();
            return filename.length > 8 ? '' : filename;
        })
        .filter(Boolean);
}

// 提取所有gl3-img下img的src链接最后一部分和alt值，返回一个字典
function getPicksNameDict() {
    const dict = {};
    document.querySelectorAll('.gl3-img img').forEach(img => {
        const filename = (img.getAttribute('src') || '').split('/').pop();
        if (filename) dict[filename] = img.getAttribute('alt') || '';
    });
    return dict;
}

function getTopLeftImgSrcFilename() {
    const img = document.querySelector('.md-top-left .mdl-img');
    if (img && img.getAttribute('src')) {
        return img.getAttribute('src').split('/').pop();
    }
    return '';
}

function getFirstTeamImgFilename() {
    const img = document.querySelector('.main-context .gradual .gradual-left .gl1 .team-img img');
    if (img && img.getAttribute('src')) {
        return img.getAttribute('src').split('/').pop();
    }
    return '';
}

function getLeftWinStatus() {
    const el = document.querySelector('.main-context .gradual .gradual-left .gl1 .reslute-img');
    return el ? /display\s*:\s*none/.test(el.getAttribute('style') || '') : false;
}

function getrightWinStatus() {
    const el = document.querySelector('.main-context .gradual .gradual-right .gl1 .reslute-img');
    return el ? /display\s*:\s*none/.test(el.getAttribute('style') || '') : false;
}

function getWinner() {
    if (getLeftWinStatus() === getrightWinStatus()) {
        return '';
    } else if (getLeftWinStatus()) {
        return getWhoChooseBlueside() ? 1 : 2;
    } else if (getrightWinStatus()) {
        return getWhoChooseBlueside() ? 2 : 1;
    }
}

function getWhoChooseBlueside() {
    return getTopLeftImgSrcFilename() === getFirstTeamImgFilename() ? true : false;
}
function getLength() {
    const el = document.querySelector('.gradual .gradual-center .center1');
    return el ? el.textContent.trim() : '';
}

function getPrint() {
    // 获取所有需要的元素和数据
    let allBans = getBans();
    let allPick4Dict = getPicksNameDict();
    let allPickBySide = getPicksBySide();
    let length = getLength();
    let getSide = ""; // 默认左侧为蓝色方
    let team1side, team2side, t1h, t2h, t1b, t2b;
    let winner = getWinner();
    winner === '' ? length = '' : length = length;

    // 按heroImgs顺序，查找gl3ImgAltDict的值
    let pickAlts = allPickBySide.map(filename => allPick4Dict[filename] || '');
    let pickleft = pickAlts.filter((_, i) => i % 2 === 0);
    let pickright = pickAlts.filter((_, i) => i % 2 === 1);

    // 用dataArray的text匹配pickleft、pickright、allBans的值，匹配到则替换为value
    function mapWithDataArray(arr) {
        if (!Array.isArray(dataArray)) return arr;
        return arr.map(val => {
            const found = dataArray.find(item => item.text === val);
            return found ? found.value : val;
        });
    }
    pickleft = mapWithDataArray(pickleft);
    pickright = mapWithDataArray(pickright);
    allBans.leftAlts = mapWithDataArray(allBans.leftAlts);
    allBans.rightAlts = mapWithDataArray(allBans.rightAlts);

    if (getWhoChooseBlueside()) {
        getSide = true; // 左侧为蓝色方

    } else {
        getSide = false; // 左侧为红色方
    }
    if (getSide) {
        team1side = 'blue';
        team2side = 'red';
        t1h = pickleft;
        t2h = pickright;
        t1b = allBans.leftAlts;
        t2b = allBans.rightAlts;
    } else {
        team1side = 'red';
        team2side = 'blue';
        t1h = pickright;
        t2h = pickleft;
        t1b = allBans.rightAlts;
        t2b = allBans.leftAlts;
    }

    let result = [
        `        |team1side=${team1side} |team2side=${team2side} |length=${length} |winner=${winner}`,
        '        <!-- Hero picks -->',
        `        |t1h1=${t1h[0] || ''} |t1h2=${t1h[1] || ''} |t1h3=${t1h[2] || ''} |t1h4=${t1h[3] || ''} |t1h5=${t1h[4] || ''}`,
        `        |t2h1=${t2h[0] || ''} |t2h2=${t2h[1] || ''} |t2h3=${t2h[2] || ''} |t2h4=${t2h[3] || ''} |t2h5=${t2h[4] || ''}`,
        '        <!-- Hero bans -->',
        `        |t1b1=${t1b[0] || ''} |t1b2=${t1b[1] || ''} |t1b3=${t1b[2] || ''} |t1b4=${t1b[3] || ''} |t1b5=${t1b[4] || ''}`,
        `        |t2b1=${t2b[0] || ''} |t2b2=${t2b[1] || ''} |t2b3=${t2b[2] || ''} |t2b4=${t2b[3] || ''} |t2b5=${t2b[4] || ''}`
    ].join('\n');
    console.log(result);
}

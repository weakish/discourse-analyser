const superagent = require('superagent')

const apiBase = process.env.API_BASE 
const url = process.env.API_URL

let topicsWithinMonth = []

function compare(x, y) {
    if (x < y) {
        return -1
    } else if (x === y) {
        return 0
    } else { // x > y
        return 1 
    }
}

function compareMonth(date, month) {
    const yyyy = date.slice(0, 4)
    const mm = date.slice(5, 7)
    const currentYear = new Date(Date.now()).getFullYear().toString()

    const compareYearResult = compare(yyyy, currentYear)
    if (compareYearResult === 0) {
        const compareMonthResult = compare(mm, month)
        if (compareMonthResult === 0) {
            return 0
        } else {
            return compareMonthResult
        }
    } else {
        return compareYearResult
    }
}

async function testFetch(url, month) {
    const res = await superagent.get(apiBase + url).set('Accept', 'application/json')
    topics = res.body.topic_list.topics
    for (const t of topics) {
        const c = compareMonth(t.created_at, month)
        if (c === 0) {
            topicsWithinMonth.push(t)
        } else if (c < 0) {
            return topicsWithinMonth
        } else {
            continue
        }
    }
    let nextPage = res.body.topic_list.more_topics_url
    return await testFetch(nextPage, month)
}

function categoryName(id) {
    const names = {
        "9": "综合讨论",
        "13": "账户和使用",
        "14": "SDK / API",
        "15": "控制台",
        "17": "数据存储",
        "19": "实时通信",
        "20": "推送通知",
        "22": "云引擎",
        "24": "开发组件",
        "32": "小程序",
        "36": "游戏解决方案"
    }
    return names[id] || id
}

(async () => {
    let topics = await testFetch(url, process.argv[2])
    let categories = {}
    for (const t of topics) {
        const categoryID = t.category_id.toString()
        if (categories.hasOwnProperty(categoryID)) {
            categories[categoryID] += 1
        } else {
            categories[categoryID] = 1
        }
    }
    for (const id in categories) {
        console.log(`${categoryName(id)}: ${categories[id]}`)
    }
})();


const superagent = require('superagent')

const apiBase = process.env.API_BASE 
const url = process.env.API_URL

let topicsWithinMonth = []

async function testFetch(url, month) {
    const currentMonth = new Date(Date.now()).getMonth()
    const nextMonth = month + 1
    const currentYear = new Date(Date.now()).getFullYear()
    const lastYear = currentYear - 1
    const year =  (currentMonth < month) ? lastYear : currentYear
    const dateEnd = new Date(year, nextMonth)
    const dateStart = new Date(year, month)
    const res = await superagent.get(apiBase + url).set('Accept', 'application/json')
    topics = res.body.topic_list.topics
    for (const t of topics) {
        const created = new Date(t.created_at)
        if (created > dateEnd) {
            continue
        } else {
            if (created > dateStart) {
                topicsWithinMonth.push(t)
            } else {
                return topicsWithinMonth
            }
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
    // In JavaScript, Date() month starts from zero
    let topics = await testFetch(url, parseInt(process.argv[2]) - 1)
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


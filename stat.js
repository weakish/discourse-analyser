const superagent = require('superagent')

const apiBase = 'https://example.com' 
const url = '/c/exampleCategory/?order=created'

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
    for (t of topics) {
        let c = compareMonth(t.created_at, month)
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

(async () => {
    let result = await testFetch(url, "03")
    console.log(result.length)
})();


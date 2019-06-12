const fs = require('fs')

function link() {
    const stdin = fs.readFileSync('/dev/stdin').toString()
    return stdin.replace(/#[0-9]+/g, '[$&](' + process.env.API_BASE + '/t/$&)')

}

console.log(link())
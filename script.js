/* AsanoBBS - script.js */

let debugMode = false;

/* library */
const Cookie = this.Cookies;

/* constant */
const SEC = sec => sec * 1000;
const MIN = min => min * SEC(60);
const HR = hr => hr * MIN(60);
const DAY = day => day * HR(24);

/* useful functions */
// jsonリクエスト
const request = (path, type, object) =>
  fetch(path, {
    method: type,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(object)
  }).then(res => res.json());
// object空判定
const isEmptyObj = obj => {
  for (let i in obj) return false;
  return true;
}
// htmlElementsのforEach
const htmlForEach = (html, func) => Array.prototype.forEach.call(html, func);
// URLクエリ
const getUrlQueries = () => {
  const queryStr = window.location.search.slice(1);
  let queries = {};
  if (!queryStr) return queries;
  queryStr.split("&").forEach(queryStr => {
    let queryArr = queryStr.split("=");
    queries[queryArr[0]] = queryArr[1];
  });
  return queries;
};
const getUrlQueriesByUrl = url => {
  let queriePos = url.indexOf("?");
  if (queriePos === -1) return {};
  let querieStr = url.substring(queriePos + 1);
  let queries = {};
  queryStr.split("&").forEach(queryStr => {
    let queryArr = queryStr.split("=");
    queries[queryArr[0]] = queryArr[1];
  });
  return queries;
}
// 文字列に１行書き足す
const addLine = (str, line, newLineCode = "\n") =>
  str + (str == "" ? "" : newLineCode) + line;
const addLineObj = (obj, key, line) => (obj[key] = addLine(obj[key], line));
const addLineInnerHTML = (element, line) =>
  (element.innerHTML = addLine(element.innerHTML, line, "<br />"));
// class="" をいじる
const className = {
  list: function(element) {
    return element.className.split(" ");
  },
  check: function(element, styleClass) {
    return this.list(element).some(c => c == styleClass);
  },
  add: function(element, styleClass) {
    if (!this.check(element, styleClass)) {
      let classList = this.list(element);
      classList.push(styleClass);
      element.className = classList.join(" ");
      return true;
    }
    return false;
  },
  remove: function(element, styleClass) {
    if (this.check(element, styleClass)) {
      element.className = this.list(element)
        .filter(c => c != styleClass)
        .join(" ");
      return true;
    }
    return false;
  }
};
// promiseラップ
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* functions */

const debugText = document.getElementById("debug");
function debug(msg) {
  if (debugMode) {
    debugText.style = "padding: 3px";
    addLineInnerHTML(debugText, msg);
  }
  console.log(msg);
}

function start() {

  // URLクエリ取得
  const urlQueries = getUrlQueries();
  if (urlQueries.debug) debugMode = true;
  // デバッグモード引き継ぎ
  if (debugMode) htmlForEach(document.getElementsByTagName("a"), element => {
    const url = element.href;
    debug("check \"" + url + "\"");
    if (
      (url.startsWith("http://") && !url.startsWith("http://asanobbs.github.io")) ||
      (url.startsWith("https://") && !url.startsWith("https://asanobbs.github.io")) ||
      (url.startsWith("//") && !url.startsWith("//asanobbs.github.io"))
    ) return;
    debug("yes!");
    let queries = getUrlQueriesByUrl(url);
    if (isEmptyObj(queries)) element.href += "?debug=true";
    else element.href += "&debug=true";
    debug("\"queries\": " + JSON.stringify(queries));
  });

  // windowサイズによって変えるやつ
  forCSS();
  window.addEventListener("load", e => {
    forCSS();
  });
  window.addEventListener("resize", e => {
    forCSS();
  });

  // ページ毎
  const path = location.pathname;
  debug("path: " + path);
  switch (path) {
    case "/":
      {
        
      }
      break;
  }

}

let googleUser = null;
// on google signin
function onSignIn(user) {
  googleUser = user;
  htmlForEach(
    document.getElementsByClassName("myicon"),
    element => {
        element.src = googleUser.wt.hK;
    }
  );
  debug("Googleログイン成功！");
  debug("\"googleUser\": " + JSON.stringify(googleUser, null, 2));
}

function forCSS() {
  
}

/* start */

start();

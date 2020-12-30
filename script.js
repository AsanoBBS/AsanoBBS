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
// promiseラップ
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/* constant */
const NavStates = {
  HIDDEN: 0,
  SHOW:   1,
  SHOWED: 2,
  HIDE:   3,
};

/* values */
let mobile = false;
let navState = NavStates.HIDDEN;
let navMove = 0;  // 0(hidden) ~ 10(showed)

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

  // スマホチェック
  mobile = navigator.userAgent.match(/iPhone|Android.+Mobile/);
  if (mobile) {   // スマホ
    mobile = true;
    // nav
    document.getElementsByTagName("nav")[0].classList.add("mobilenav");
  } else {        // PC
    mobile = false;
    // headericonは隠す
    document.getElementById("headericon").classList.add("hide");
    // navhideも
    document.getElementById("navhide").classList.add("clear");
    // main
    document.getElementsByTagName("main")[0].classList.add("pcmain");
    // nav
    document.getElementsByTagName("nav")[0].classList.add("pcnav");
  }
  debug("mobile: " + mobile);

  // windowサイズによって変えるやつ
  forCSS();
  window.addEventListener("load", e => {
    forCSS();
  });
  window.addEventListener("resize", e => {
    forCSS();
  });

  // メニュー
  const onNavShow = () => {
    if (mobile) {
      debug("click show");
      if (navState === NavStates.HIDDEN) {
        document.getElementById("navshowdark").classList.remove("hide");
        wait(20).then(navAnimation);
      }
      navState = NavStates.SHOW;
      debug("start show");
    }
  };
  document.getElementById("headericon").onclick = onNavShow;
  const onNavHide = () => {
    if (mobile) {
      debug("click hide");
      if (navState === NavStates.SHOWED) {
        wait(20).then(navAnimation);
      }
      navState = NavStates.HIDE;
      debug("start hide");
    }
  };
  document.getElementById("navhide").onclick = onNavHide;
  document.getElementById("navshowdark").onclick = onNavHide;

  // ページ毎
  const path = location.pathname;
  debug("path: " + path);
  switch (path) {
    case "/": {
        
      }
      break;
  }

}

// nav animation
function navAnimation() {
  // move
  if (navState === NavStates.SHOW) navMove++;
  if (navState === NavStates.HIDE) navMove--;
  debug("navMove: " + navMove);
  // reflect
  document.getElementsByClassName("mobilenav")[0].style.left =
    (25 + 75 * Math.cos(Math.PI / 2 * navMove / 10)) + "%";
  debug("[nav move] state: " + navState + ", left: " + (25 + 75 * Math.cos(Math.PI / 2 * navMove / 10)) + "%");
  // next
  if (navMove == 0) {
    navState = NavStates.HIDDEN;
    document.getElementById("navshowdark").classList.add("hide");
  }
  else if (navMove == 10) navState = NavStates.SHOWED;
  else wait(20).then(navAnimation);
}

let googleUser = null;
// on google signin
function onSignIn(user) {
  googleUser = user;
  if (mobile) document.getElementById("headericon").classList.remove("hide");
  htmlForEach(
    document.getElementsByClassName("myicon"),
    element => {
        element.style.visibility = "visible";
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

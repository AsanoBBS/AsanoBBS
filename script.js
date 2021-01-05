/* AsanoBBS - script.js */

let debugMode = false;

/* constant */
const GAS = "https://script.google.com/macros/s/AKfycbzJmMih0WMHOfUHncUlwK7ez7bNr_le2dnCkNxYCo1b9ROMo9-g/exec";
const SEC = sec => sec * 1000;
const MIN = min => min * SEC(60);
const HR = hr => hr * MIN(60);
const DAY = day => day * HR(24);
const NavStates = {
  HIDDEN: 0,
  SHOW:   1,
  SHOWED: 2,
  HIDE:   3,
};

/* classes */
class Users {
  constructor(uuid_token) {
    this.uuid_token = uuid_token;
    this.users = {};
  }
  loadUser(id) {
    return AsanoBBSApis.getProfile(id)
      .then(res => {
        this.users[res.user_id] = {
          name: res.profile.name,
          email: res.profile.email,
          icon: res.profile.icon,
        };
        return this.users[id];
      });
  }
}

/* useful functions */
// 文字列一致判定(大文字小文字無視)
const equalsIgnoreCase = (a, b) =>
  (a.toUpperCase() === b.toUpperCase());
// 名前付きエラー生成
const newErrorWithName = (name, message) => {
  const error = new Error(message);
  error.name = name;
  return error;
}
// jsonリクエスト
const request = (url, method = "GET", reqBody = {}) => {
  debug(`requested to "${url}", mothod is "${method}"`);
  const options = {
    "method": method,
    "headers": {
      //"Content-Type": "application/json"
      // CROS制限回避
      "Content-Type": "text/plain"
    },
  };
  if (!equalsIgnoreCase(method, "GET")) options["body"] = JSON.stringify(reqBody);
  return fetch(url, options)
    .then(res => res.text())
    .then(res => {
      debug(`response is "${res}"`);
      return JSON.parse(res);
    })
    .then(res => {
      if (res.error) throw newErrorWithName(res.error.name, res.error.message);
      return res;
    });
}
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
// requestAnimationFrame
const requestAnimationFrame =
  window.requestAnimationFrame || 
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame || 
  window.msRequestAnimationFrame ||
  (callback => setTimeout(() => callback(performance.now()), 15));
// promiseラップ
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const animationWait = () => new Promise(resolve => requestAnimationFrame(resolve));

/* values */
let mobile = false;
let navState = NavStates.HIDDEN;
let navMove = 0;  // 0(hidden) ~ 1(showed)
let uuid_token;
let myProfile;
let users;

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
    debug('check "' + url + '"');
    if (
      (url.startsWith("http://") && !url.startsWith("http://asanobbs.github.io")) ||
      (url.startsWith("https://") && !url.startsWith("https://asanobbs.github.io")) ||
      (url.startsWith("//") && !url.startsWith("//asanobbs.github.io"))
    ) return;
    debug("yes!");
    let queries = getUrlQueriesByUrl(url);
    if (isEmptyObj(queries)) element.href += "?debug=true";
    else element.href += "&debug=true";
    debug('"queries": ' + JSON.stringify(queries));
  });

  // スマホチェック
  mobile = navigator.userAgent.match(/iPhone|Android.+Mobile/);
  if (mobile) {   // スマホ
    mobile = true;
    // nav
    document.getElementsByTagName("nav")[0].classList.add("mobilenav");
  } else {        // PC
    mobile = false;
    // navhideを消す
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
      debug("show!");
      if (navState === NavStates.HIDDEN) {
        document.getElementById("navshowdark").classList.remove("hide");
        navAnimation(performance.now());
      }
      navState = NavStates.SHOW;
    }
  };
  document.getElementById("headericon").onclick = onNavShow;
  const onNavHide = () => {
    if (mobile) {
      debug("hide!");
      if (navState === NavStates.SHOWED) {
        navAnimation(performance.now());
      }
      navState = NavStates.HIDE;
    }
  };
  document.getElementById("navhide").onclick = onNavHide;
  document.getElementById("navshowdark").onclick = onNavHide;

  // ログインチェック
  uuid_token = Cookies.get("uuid_token");
  if (uuid_token) login();

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
let before = null;
function navAnimation(time) {
  debug("time: " + time);
  if (!before) before = time;
  const elapsed = time - before;
  debug("elapsed: " + elapsed);
  // move
  if (navState === NavStates.SHOW) navMove += elapsed / SEC(0.25);
  if (navState === NavStates.HIDE) navMove -= elapsed / SEC(0.25);
  // reflect
  const per = (Math.cos(Math.PI * navMove) + 1) / 2;
  document.getElementsByClassName("mobilenav")[0].style.left =
    (20 + 80 * per) + "%";
  // before
  before = time;
  // next
  if (navMove < 0) {
    navMove = 0;
    document.getElementsByClassName("mobilenav")[0].style.left = "100%";
    navState = NavStates.HIDDEN;
    document.getElementById("navshowdark").classList.add("hide");
    before = null;
  } else if (navMove > 1) {
    navMove = 1;
    document.getElementsByClassName("mobilenav")[0].style.left = "20%";
    navState = NavStates.SHOWED;
    before = null;
  } else animationWait().then(navAnimation);
}

function login() {
  if (!uuid_token) throw new Error(`uuid_token is ${uuid_token}`);
  //request(`${GAS}?where=profile&uuid_token=${uuid_token}`)
  AsanoBBSApis.getProfile()
    .then(res => {
      users = new Users(uuid_token);
      myProfile = {
        id: res.user_id,
        name: res.profile.name,
        email: res.profile.email,
        icon: res.profile.icon,
      }
      users.users[myProfile.id] = myProfile;
      // html書き換え
      if (mobile) document.getElementById("headericon").classList.remove("hide2");
      htmlForEach(
        document.getElementsByClassName("myicon"),
        element => {
          element.style.visibility = "visible";
          element.src = myProfile.icon;
        }
      );
    })
    .catch(e => {
      uuid_token = undefined;
      debug("[failed to login] " + e.name + ": " + e.message);
      window.alert("ログインに失敗しました。");
    });
}

// on google signin
function onSignIn(googleUser) {
  debug("Googleログイン成功！");
  debug('"googleUser": ' + JSON.stringify(googleUser, null, 2));
  // 浅野生かどうかの事前確認
  if (googleUser.getBasicProfile().getEmail().endsWith("@asano.ed.jp")) {
    // get uuid_token by access_token
    const access_token = googleUser.xc.access_token;
    debug("access_token: " + access_token);
    //request(`${GAS}?where=login&access_token=${access_token}`)
    AsanoBBSApis.login(access_token)
      .then(token => {
        debug("uuid_token: " + token);
        // ユーザープロフィールの取得
        login();
      })
      .catch(e => {
        debug("[failed to login] " + e.name + ": " + e.message);
        window.alert("ログインに失敗しました。");
      });
  } else {
    debug("you are not an Asano student");
    window.alert("浅野のgoogleアカウントでログインしてください");
  }
  // sign out
  gapi.auth2.getAuthInstance().signOut()
    .then(() => debug("g-signin2 signed out"));
}

function forCSS() {
  
}

// GAS関係
function requestGAS(where, queries, method = "GET", payload = {}) {
  if (
    equalsIgnoreCase(method, "GET") ||
    equalsIgnoreCase(method, "POST")
  ) throw new Exception("GAS only supports GET and POST.");
  return request(
    `${GAS}?` +
    Object.entries(Object.assign(
      Object.assign(
        { "where": where },
        (where == "login" ? {} : { "uuid_token": uuid_token })
      ),
      queries
    )).map(pear => `${pear[0]}=${pear[1]}`).join("&"),
    method,
    payload
  ).then(res => {
    if (res.uuid_token != uuid_token) {
      uuid_token = res.uuid_token;
      Cookies.set("uuid_token", uuid_token, { expires: 31 });
    }
    return res;
  });
}
const AsanoBBSApis = {
  login: function(access_token) {
    return requestGAS("login", { "access_token": access_token })
      .then(res => res.uuid_token);
  },
  token_reset: function(access_token) {
    return requestGAS("login", { "access_token": access_token, token_reset: "true" })
      .then(res => res.uuid_token);
  },
  getProfile: function(user_id = null) {
    return requestGAS("profile", (user_id ? { "user_id": user_id } : {}), "GET");
  },
}

/* start */

start();

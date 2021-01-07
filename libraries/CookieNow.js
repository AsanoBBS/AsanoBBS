/* CookieNow.js by s2018085 */

if (document) {

  document.cookieNow = {

    cookies: {},

    reload: function() {
      this.cookies = {};
      document.cookie.split(";").forEach(item => {
        const pair = item.split("=").map(str => decodeURIComponent(str.trim()));
        try {
          this.cookies[pair[0]] = JSON.parse(pair[1]);
        } catch(e) {
          this.cookies[pair[0]] = pair[1];
        }
      });
      return this.cookies;
    },

    /**
     * set a cookie
     * If set undefined on value, delete this cookie.
     * @param key the key
     * @param value the value
     * @return new cookies
     */
    set: function(key, value, options = {}) {
      if (value === undefined) {
        document.cookies = `${encodeURIComponent(key)}=deleted ;max-age=0`;
        delete(this.cookies[key]);
      } else {
        let item = `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
        if (options.path) item += `; path=${options.path}`;
        if (options.domain) item += `; domain=${options.domain}`;
        if (options["max-age"]) item += `; max-age=${options["max-age"]}`;
        if (options.secure) item += `; secure`;
        document.cookies = item;
        this.cookies[key] = value;
      }
      this.cookies;
    },

  }

  document.cookieNow.reload();

}

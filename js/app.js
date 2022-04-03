main();

function main() {
  document.addEventListener("DOMContentLoaded", () => {
    // Have to use full tabs permissions (instead of the less-invasive "activeTab" permission)
    // because activeTab can only be used as an argument when doing chrome.action.onClicked,
    // (among a few other apis which don't suit my case)
    // which frustratingly doesn't work well with showing a popup with a keyboard shortcut.
    // So using the "DOMContentLoaded" listener with a full tabs query is the kludge for now.
    // (using the DOMContentLoaded method for performing an action after popup appears was
    // recommended in chrome docs)
    let currentTabUrl;
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        // todo: actually figure out how modules work so this doesn't get executed when options.html loads
        document.getElementById("status_msg").innerHTML =
          "Adding custom URL...";
        currentTabUrl = tabs[0]["url"];

        addCustomThought(currentTabUrl)
          .then((res) => {
            if (res.status && res.status === 200) {
              console.log(res.message_verbose);
              document.getElementById("status_msg").style.color = "forestgreen";
              document.getElementById("status_msg").innerHTML = res.message;
            }
          })
          .catch((e) => {
            console.error(e);
            document.getElementById("status_msg").style.color = "red";
            document.getElementById("status_msg").innerHTML = e;
          });
      }
    );
  });
}

async function addCustomThought(url) {
  console.log(url);
  let urlRegex =
    /(((http[s]?:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  let urlMatch;
  if (url) {
    urlMatch = url.match(urlRegex);
  }
  if (!urlMatch) {
    throw "Not a valid URL.";
  }

  const [curatorEmail, curatorPass] = await getAuthStatus();

  const request = `https://api.cicero.ly/admin/curator/thoughts/new?curatorEmail=${curatorEmail}&curatorPass=${curatorPass}&extensionPass=9saGbMoDek4yLjQKJfqyh9fAgAdKhwH8HQX8LUjh6pQjsuVdPt`;
  const requestBody = {
    newThought: true,
    url: url,
  };
  let res = await fetch(request, {
    method: "post",
    body: new Blob([JSON.stringify(requestBody)], { type: "application/json" }),
  });
  if (res.status !== 200) {
    console.error(res);
    throw { status: res.status, error_message: res.message_verbose };
  }
  return res.json();
}

export function getAuthStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["ciceroUser"], (res) => {
      if (!res.ciceroUser || Object.keys(res.ciceroUser)?.length === 0) {
        reject(
          'Not authenticated. Please right-click the extension icon, click "options", and login.'
        );
      }
      resolve([res.ciceroUser.email, res.ciceroUser.password]);
    });
  });
}

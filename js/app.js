document.addEventListener("DOMContentLoaded", (event) => {
    console.log('popup dom loaded');

    // Have to use full tabs permissions (instead of the less-invasive "activeTab" permission)
    // because activeTab can only be used as an argument when doing chrome.action.onClicked,
    // (among a few other apis which don't suit my case)
    // which frustratingly doesn't work well with showing a popup with a keyboard shortcut. 
    // So using the "DOMContentLoaded" listener with a full tabs query is the kludge for now.
    // (using the DOMContentLoaded method for performing an action after popup appears was
    // recommended in chrome docs) 
    let currentTabUrl;
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        console.log('tabs', tabs)
        currentTabUrl = tabs[0].url;

        addCustomThought(currentTabUrl)
        .then(res => {
            if (res.status && res.status === 200) {
                console.log(res.message_verbose);
                document.getElementById("status_msg").innerHTML = res.message;
            } 
        })
        .catch(e => {
            console.error(e);
            document.getElementById("status_msg").innerHTML = e;
        })
    });
});

async function addCustomThought(url) {
    const [curatorEmail, curatorPass] = await getAuthStatus();
    const request = `https://api.cicero.ly/admin/curator/thoughts?curatorEmail=${curatorEmail}&curatorPass=${curatorPass}&extensionPass=9saGbMoDek4yLjQKJfqyh9fAgAdKhwH8HQX8LUjh6pQjsuVdPt`
    const requestBody = {
            newThought: true,
            url: url
    }
    let res = await fetch(request, {
        method: "post",
        body: new Blob([JSON.stringify(requestBody)], {type : 'application/json'})
    });
    if (res.status !== 200) {
        throw { status: res.status, error_message: res.message_verbose }
    }
    return res.json();
}

function getAuthStatus() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get('ciceroUser', res => {
            if (!res) {
                reject([undefined, undefined]);
            }
            resolve([res.ciceroUser.email, res.ciceroUser.password]);
        })
    });
}
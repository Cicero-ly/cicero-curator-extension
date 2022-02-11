chrome.action.onClicked.addListener(async () => {
    // todo: bypass the chrome.tabs.query and use tab that should be the default arg for this addListener call
    let tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })
    let currentTab = tabs[0];
    console.log('log current tab url:', currentTab.url);

    let res = await addCustomThought(currentTab.url);
    console.log(res);
});

async function addCustomThought(url) {
    const [curatorEmail, curatorPass] = await getAuthStatus();
    const request = `https://dev-api.cicero.ly/admin/curator/thoughts?curatorEmail=${curatorEmail}&curatorPass=${curatorPass}&pass=AyEDyX%268%26YXx8qhSuX2%23TGURb9SAjxkMjpfG!%5E6aCcg%23H3!dTwCuPoDD%23dMWvJN6%40S%24Je`
    const requestBody = {
            newThought: true,
            url: url
    }
    let res = await fetch(request, {
        method: "post",
        body: new Blob([JSON.stringify(requestBody)], {type : 'application/json'})
    });
    // just for testing...
    // const request = `https://dev-api.cicero.ly/admin/curator/fetch-meta-tags?url=${url}&curatorEmail=${curatorEmail}&curatorPass=${curatorPass}&pass=AyEDyX%268%26YXx8qhSuX2%23TGURb9SAjxkMjpfG!%5E6aCcg%23H3!dTwCuPoDD%23dMWvJN6%40S%24Je`;
    // let res = await fetch(request, {
    //     method: "get",
    // });
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
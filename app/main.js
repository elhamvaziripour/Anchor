// If we want the extension enable, but the proxy and verifier disabled
var config = {
        mode: "direct"};
chrome.proxy.settings.set(
          {value: config, scope: 'regular'},
          function() {});
 
function setProxy(){
var config = {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
       
	
         host: "127.0.0.1",
	port:8080
   
           
          }
        }
      };
      chrome.proxy.settings.set(
          {value: config, scope: 'regular'},
          function() {});

}
function unsetProxy(){
var config = {
        mode: "direct"};
chrome.proxy.settings.set(
          {value: config, scope: 'regular'},
          function() {});
 
}
var port = null;
var active_tabs_status = {};
function onNativeMessage(message) {
   alert(appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>"));
}

function sendNativeMessage(message) {
  port.postMessage(message);
 }

/*
  For the first time when the proxy is inactive, 
  the new connection to the host will be created!

*/
/*
  The user interface for the App:
  Take the tabid and change the icon.
  if the status is Disable-Proxy-Verifier-Off it means the proxy is disabled
  and for every active tab we need to make sure that the icon is updated!
  Based on the status, the following figures will be loaded for the current tab:
  *************** Just make sure that the traffic is related to the current tab and it is http/s traffic ****************
  Disable-Proxy-Verifier-Off : icon_1.png
  Enable-Proxy-Verifier-Off : icon_3.png
  Enable-Proxy-Verifier-Idle : icon_3.png
  Enable-Proxy-Verifier-On-Signature-Invalid : icon_2.png
  Enable-Proxy-Verifier-On-Signature-NotAvailable : icon_2.png
  Enable-Proxy-Verifier-On-Signature-Valid : icon_4.png

*/
function updateUiState(tabId) {
   /*
   if ((tabId in active_tabs_status) == 0){
          
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_1.png', '38': 'images/icon_1@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is disabled!'});
          chrome.pageAction.show(tabId);
     }
     */ 

  if (!port){
      chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
          chrome.pageAction.setIcon({tabId: tabs[i].id,'path': {'19': 'images/icon_1.png', '38': 'images/icon_1@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabs[i].id,title: 'Proxy is disabled!'});
          chrome.pageAction.show(tabs[i].id);
        }
      });
  }

  else{
     
     switch(active_tabs_status[tabId]) {
        case "Disable-Proxy-Verifier-Off" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_1.png', '38': 'images/icon_1@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is disabled!'});
          delete active_tabs_status[tabId];
          break;
        case "Enable-Proxy-Verifier-Off" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_3.png', '38': 'images/icon_3@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is Enable!Verifier is Off!'});
          delete active_tabs_status[tabId];
          break;
        case "Enable-Proxy-Verifier-Idle" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_3.png', '38': 'images/icon_3@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is Enable!Verifier is Idle!'});
          
      chrome.tabs.query({}, function(tabs){
        for (var i = 0; i < tabs.length; i++) {
            if  (!(tabs[i].id  in active_tabs_status)){
          chrome.pageAction.setIcon({tabId: tabs[i].id,'path': {'19': 'images/icon_3.png', '38': 'images/icon_3@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabs[i].id,title: 'Proxy is Enable!Verifier is Off!'});
          chrome.pageAction.show(tabs[i].id);
	}
        }
      });
          break;
        case "Enable-Proxy-Verifier-On-Signature-Invalid" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_2.png', '38': 'images/icon_2@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is Enable!Signature is not valid!'});
          break;
        case "Enable-Proxy-Verifier-On-Signature-NotAvailable" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_2.png', '38': 'images/icon_2@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is Enable!Signature is not supported by server!'});
          break;
        case "Enable-Proxy-Verifier-On-Signature-Valid" :
          chrome.pageAction.setIcon({tabId: tabId,'path': {'19': 'images/icon_4.png', '38': 'images/icon_4@2x.png'}});
          chrome.pageAction.setTitle({tabId: tabId,title: 'Proxy is Enable!Signature is valid!'});
          break;
        default:
          chrome.pageAction.show(tabId);
// vaghti ke ye tab mige proxy active! baghiye taba ham bayad avaz beshe!      

     }
    chrome.pageAction.show(tabId);
}
}
function connect() {
setProxy();
  alert('connecting to proxy');
  var hostName = "com.anchor";
  port = chrome.runtime.connectNative(hostName);
  if (port){
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
    
  }
  
  sendNativeMessage("start");
}


/*
  When the user wants the last active tab to deactivate,
  the port to the host will be closed!
  Before closing the port, host will receive a message in order to
  change the proxy settting in the system and have it automated.
*/
function disconnect() {
  unsetProxy();
  sendNativeMessage("stop");
      // chrome.proxy.settings.get(
        //  {'incognito': false},
          //function(config) {alert(JSON.stringify(config));});
  alert('Proxy is stoped!');
  port.disconnect();
  port = null;
  updateUiState(0);

 }
 
 function onDisconnected() {
  port = null;
  updateUiState(0);   
}


chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  chrome.pageAction.show(tabId);
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  lastTabId = tabs[0].id;
  chrome.pageAction.show(lastTabId);
});
chrome.tabs.onActivated.addListener(function(info){

    var tab = chrome.tabs.get(info.tabId, function(tab) {
        chrome.pageAction.show(info.tabId);
    });
});

chrome.tabs.onActiveChanged.addListener( function(tabId, info) {
        chrome.pageAction.show(tabId);
    
});
chrome.tabs.onCreated.addListener(function(tab) {

  updateUiState(tab.id);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.url){
  if(active_tabs_status[tabId] ==  "Enable-Proxy-Verifier-On-Signature-Invalid" || active_tabs_status[tabId] ==  "Enable-Proxy-Verifier-On-Signature-Valid" )
                  active_tabs_status[tabId] = "Enable-Proxy-Verifier-Idle";
  }              
  updateUiState(tabId);
  
});
chrome.tabs.onRemoved.addListener(function (tabId) {
   if (Object.keys(active_tabs_status).length == 1){
     
     disconnect();
}
   delete active_tabs_status[tabId];

});

/*
  If the header include the signiture,
  then according to the valid field which has been set with the proxy
  status of the current tab will be updated!
  If the header doesn't have signiture status : Enable-Proxy-Verifier-On-Signature-NotAvailable
  else
  according to the previous value of the active_tabs_status[tabId],
  it is updated!
  {valid, not valid, not supported} + {Not valid} => {not valid}
  {valid, not supported} + {valid} => {valid}
  {not supported} + {not supported} => {not supported}
  
  if it is the first time, then the default value would be the current status(according to the header)
*/


chrome.webRequest.onHeadersReceived.addListener(function(details) {
  //chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //for (var i = 0; i < tabs.length; i++) {
      //  tabId = tabs[i].id;

        tabId = details.tabId;
        if (tabId in active_tabs_status){
         // obj = JSON.parse(details.responseHeaders);
          var signature = 0;
          details.responseHeaders.forEach(function(v){
              if(v.name == "signature")
                  signature = 1;
          });

            if (signature){
              
              details.responseHeaders.forEach(function(v){
               
              if(v.name == "trust"){
                  if(v.value=="1"){
                      
                      
                      switch (active_tabs_status[tabId]) {
                        case "Enable-Proxy-Verifier-Idle" :
                            active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-Valid";
                            
                            break;
                        case "Enable-Proxy-Verifier-On-Signature-Invalid" :  
                            active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-Invalid";
                            break;
                        case "Enable-Proxy-Verifier-On-Signature-NotAvailable" :
                            active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-NotAvailable";
                            break;
                        default:
                            active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-Valid";
                      }
                  }
                  else{
                      active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-Invalid";
                  }
              }    
            });
             // alert("with signature!");
              //sendNativeMessage(tabId);
          }
              
          else{
              //sendNativeMessage(tabId);
              active_tabs_status[tabId] = "Enable-Proxy-Verifier-On-Signature-NotAvailable";
            }
        }  
        updateUiState(tabId);       
    //}       
  //});      
}, {urls: ["<all_urls>"]},  ['blocking', 'responseHeaders']);


/*
  when a user click on the icon, 
  status of the app for current tab will change!
  if there is a valid port, it means proxy is active.
  otherwise proxy is inactive! 
  For an active proxy, the click event have the icon status changed.
  if Proxy is active(port is not null):
    if current tab ?= last tab ----> Have proxy disabled(close port),
                                     Set the icon-status = Disable-Proxy-Verifier-Off 
    else
        Set the icon-status = Enable-Proxy-Verifier-Off                                      

  if Proxy is inactive(port is null): 
    so current tab = first tab -----> Have proxy enabled,
                                       Set the icon-status = Enable-Proxy-Verifier-Idle

*/
chrome.pageAction.onClicked.addListener( function (tab) {

  if (!port) {
      connect();
      active_tabs_status[tab.id]= "Enable-Proxy-Verifier-Idle";
      
  }
  else {
      if (Object.keys(active_tabs_status).length == 1 && tab.id in active_tabs_status) {
        active_tabs_status[tab.id] = "Disable-Proxy-Verifier-Off";
        disconnect();
      } 
      else {
        if (tab.id in active_tabs_status){
          active_tabs_status[tab.id] = "Enable-Proxy-Verifier-Off";
        }
        else{
          active_tabs_status[tab.id] = "Enable-Proxy-Verifier-Idle";
       
        }
      }
      
      
  }
    updateUiState(tab.id);
});



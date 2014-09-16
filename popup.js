var feedManager = {
  feeds : [{"id":"f1", "name":"TimesOfIndia","url":"http://timesofindia.indiatimes.com/rssfeedsdefault.cms"},
           {"id":"f2", "name":"EconTimes","url":"http://economictimes.indiatimes.com/rssfeedsdefault.cms"},
           {"id":"f3", "name":"TheHindu","url":"http://www.thehindu.com/news/?service=rss"},
           {"id":"f4", "name":"NDTV","url":"http://feeds.feedburner.com/NdtvNews-TopStories"},
           {"id":"f5", "name":"GoogleNews","url":"https://news.google.co.in/?output=rss"},
           {"id":"t1", "name":"TechCrunch","url":"http://feeds.feedburner.com/TechCrunch/"},
           {"id":"t2", "name":"ArsTechnica","url":"http://feeds.arstechnica.com/arstechnica/index?format=xml"},
           {"id":"t3", "name":"BetaNews","url":"http://feeds.betanews.com/bn"}],

  selectedFeedContent: [],
  currentFeedItemIdx: 0,  

  saveState: function() {
    //store any state information into chrome storage
    chrome.storage.local.set({
      "selectedFeed":$("#feedSelector").val(),
      "feedContent":this.selectedFeedContent,
      "feedIndex":this.currentFeedItemIdx
    });
  },

  displayFeed : function() {
    var formattedString = '';
    formattedString = "<a href=\"" + this.selectedFeedContent[this.currentFeedItemIdx]["link"] + "\">" + this.selectedFeedContent[this.currentFeedItemIdx]["title"] + "</a>"
    $("#ticker").html(formattedString);

    var counterString = '';
    counterString = (this.currentFeedItemIdx+1) + " / " + this.selectedFeedContent.length;
    $("#counter").html(counterString);
  },

  showPrevious: function() {
    this.currentFeedItemIdx--;
    if (this.currentFeedItemIdx < 0) this.currentFeedItemIdx = 0;
    this.saveState();
    this.displayFeed();
  },
  showNext: function() {
    var len = this.selectedFeedContent.length;
    this.currentFeedItemIdx++;
    if (this.currentFeedItemIdx >= len) this.currentFeedItemIdx = len-1;
    this.saveState();
    this.displayFeed();
  },

  requestFeed: function() {
    var manager = this;
    selectedFeedObjectID = $("#feedSelector").val();
    selectedFeed = this.feeds.filter(function(x) {return x['id']==selectedFeedObjectID})[0]

    $.get(selectedFeed["url"], function(data) {
      manager.selectedFeedContent = [];
      manager.currentFeedItemIdx = 0;
      //parse and push into feedContent
      var result = $(data).find("item").each(function() {
        var el = $(this);
        var obj = {"title": el.find("title:not(media\\:title)").text(),
                   "link": el.find("link").text()}
        manager.selectedFeedContent.push(obj);
      });

      //start display
      manager.displayFeed();
      manager.saveState();
    });
  },

  start: function() {
    var manager = this;
    //restore if feed already available in storage
    chrome.storage.local.get(function(storageData) {
      if ("selectedFeed" in storageData) {
        $("#feedSelector").val(storageData["selectedFeed"]);
        manager.selectedFeedContent = storageData["feedContent"];
        manager.currentFeedItemIdx = storageData["feedIndex"];
        manager.displayFeed();
      }
      //else start afresh
      else {
        manager.requestFeed();
      }
    });
  }
  
};

document.addEventListener('DOMContentLoaded', function () {
  //register link click handler so that all links can open in a new tab
  $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
  });

  //populate feed options in select box and add change handler
  for (idx in feedManager.feeds) {
    document.getElementById("feedSelector").innerHTML += "<option value=\"" + feedManager.feeds[idx]["id"] + "\">" + feedManager.feeds[idx]["name"] + "</option>"
  }
  $("#feedSelector").change(function() {
    feedManager.requestFeed();
  });

  //add handlers for navigation buttons
  $("#leftButton").click(function() {
    feedManager.showPrevious();
  });
  $("#rightButton").click(function() {
    feedManager.showNext();
  });

  //start feed
  feedManager.start();
});

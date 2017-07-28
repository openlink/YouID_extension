/*
 *  This file is part of the OpenLink Structured Data Sniffer
 *
 *  Copyright (C) 2015-2016 OpenLink Software
 *
 *  This project is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by the
 *  Free Software Foundation; only version 2 of the License, dated June 1991.
 *
 *  This program is distributed in the hope that it will be useful, but
 *  WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 *  General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 *
 */


if (Browser.isChromeAPI) 
{
  var setting = new Settings();

  Browser.api.webRequest.onBeforeSendHeaders.addListener(
        function(details) 
        {
          var pref_youid = null;
          var hdr_list = [];
          try {
            var v = setting.getValue("ext.youid.pref.id");
            if (v)
              pref_youid = JSON.parse(v);
          } catch(e){}

          try {
            var v = setting.getValue("ext.youid.pref.hdr_list");
            if (v && v.length>0)
              hdr_list = hdr_list.concat(JSON.parse(v));
          } catch(e){}


          if (pref_youid && pref_youid.id && pref_youid.id.length > 0) {
            details.requestHeaders.push({name:"On-Behalf-Of", value:pref_youid.id});
            details.requestHeaders.push({name:"User", value:pref_youid.id});
          }

          if (hdr_list.length > 0) {
            for(var i=0; i < hdr_list.length; i++) {
              var item = hdr_list[i]
              details.requestHeaders.push({name:item.hdr, value:item.val});
            }
          }
          
          return {"requestHeaders": details.requestHeaders};
        },
        {urls: ["<all_urls>"]},
        ["blocking", "requestHeaders"]);




  Browser.api.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      if (request.getWebId) {
        var v = setting.getValue("ext.youid.pref.id");
        sendResponse({webid: v});
      }
    });

  Browser.api.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request.getWebId) {
        var pref_youid;
        try {
          var v = setting.getValue("ext.youid.pref.id");
          if (v)
            pref_youid = JSON.parse(v);
        } catch(e){}

        sendResponse({webid: pref_youid.id});
      }
      else
        sendResponse({});  // stop
  });


}

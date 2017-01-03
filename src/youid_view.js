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

YouId_View = function(is_popup) {
  this.is_popup = is_popup;
  this.gPref = new Settings();
}

YouId_View.prototype = {
  create_youid_item: function (youid, sel)
  {
    var cls = sel ? ' class="youid_item youid_checked"' : ' class="youid_item"';
    var checked = sel ? ' checked="checked"':' ';
    var mdata = encodeURI(JSON.stringify(youid, undefined, 2));
    var uri = youid.id ? '<a href="'+youid.id+'" class="uri">'+youid.id+'</a>' : '';
    var pubkey_uri = youid.pubkey?'<a href="'+youid.pubkey+'" class="uri">'+youid.pubkey+'</a>' : '';

    var det = "";
    if (youid.exp)
       det += '<tr class="dtext"><td>Exponent</td><td>'+youid.exp+'</td></tr> ';
    if (youid.mod)
       det += '<tr class="dtext"><td>Modulus</td><td>'+youid.mod+'</td></tr> ';
    if (youid.delegate) {
       var href = youid.delegate?'<a href="'+youid.delegate+'" class="uri">'+youid.delegate+'</a>' : '';
       det += '<tr class="dtext"><td>Delegate</td><td>'+href+'</td></tr> ';
    }
    if (youid.pim) {
       var href = youid.pim?'<a href="'+youid.pim+'" class="uri">'+youid.pim+'</a>' : '';
       det += '<tr class="dtext"><td>Storage</td><td>'+href+'</td></tr> ';
    }
    if (youid.inbox) {
       var href = youid.inbox?'<a href="'+youid.inbox+'" class="uri">'+youid.inbox+'</a>' : '';
       det += '<tr class="dtext"><td>Inbox</td><td>'+href+'</td></tr> ';
    }
/***
  if (youid.acl && youid.acl.length>0) {
     var val = ""
     for(var i=0; i< youid.acl.length; i++) {
       var href = youid.acl[i]?'<a href="'+youid.acl[i]+'" class="uri">'+youid.acl[i]+'</a>' : '';
       val += '<div>'+href+'</div>';
     }
     det += '<tr class="dtext"><td>ACL</td><td>'+val+'</td></tr> ';
  }
***/
    if (youid.behalfOf && youid.behalfOf.length>0) {
      var val = ""
      for(var i=0; i< youid.behalfOf.length; i++) {
        var href = youid.behalfOf[i]?'<a href="'+youid.behalfOf[i]+'" class="uri">'+youid.behalfOf[i]+'</a>' : '';
        val += '<div>'+href+'</div>';
      }
      det += '<tr class="dtext"><td>OnBehalfOf</td><td>'+val+'</td></tr> ';
    }

    var item = '\
     <table '+cls+' id="data" mdata="'+mdata+'" > \
       <tr> \
         <td style="width:20px"><input id="chk" class="youid_chk" type="checkbox"'+checked+'></td> \
         <td class="ltext">'+youid.name+'</td> \
       </tr> \
       <tr> \
         <td> <input type="image" class="refresh_youid" src="lib/css/img/refresh.png" width="21" height="21" title="Refresh YouID details"> \
         </td> \
         <td class="itext">'+uri+'</td> \
       </tr> \
       <tr> \
         <td> <input type="image" class="remove_youid" src="lib/css/img/trash.png" width="21" height="21" title="Drop YouID item from list"> \
         </td> \
         <td class="dtext"> \
           <input type="image" class="det_btn" src="lib/css/img/plus.png" width="12" height="12" title="Show details"> \
           Details \
         </td> \
       </tr> \
       <tr id="det_data" style="display:none"> \
         <td></td> \
         <td> \
           <table class="dettable" > \
             <tr class="dtext"><td style="width:70px">PubKey</td><td >'+pubkey_uri+'</td> \
             </tr> '+det+' \
           </table> \
         </td> \
       </tr> \
     </table>';
    return item;
  },

  load_youid_list: function ()
  {
    var pref_youid = null;
    var list = [];
    var self = this;

    try {
      var v = this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    try {
      var v = this.gPref.getValue("ext.youid.pref.list");
      if (v)
        list = JSON.parse(v);
    } catch(e){}

    $.each(list, function (i, item) {
        var sel = pref_youid && pref_youid.id === item.id;
        self.addYouIdItem(item, sel);
    });

  },

  addYouIdItem: function (youid, sel)
  {
    var self = this;
    var s = this.create_youid_item(youid, sel);
    $('#youid_list').append('<tr><td>'+s+'</td></tr>');

    $('.det_btn').not('.click-binded').click(function(e){ self.click_det(e)}).addClass('click-binded');
    $('.youid_chk').not('.click-binded').click(function(e){ self.select_youid_item(e)}).addClass('click-binded');
    $('.uri').not('.click-binded').click(function(e){ self.click_uri(e)}).addClass('click-binded');
    $('.remove_youid').not('.click-binded').click(function(e){ self.click_remove_youid(e)}).addClass('click-binded');
    $('.refresh_youid').not('.click-binded').click(function(e){ self.click_refresh_youid(e)}).addClass('click-binded');
  },

  updateYouIdItem: function (row, youid)
  {
    var self = this;
    var pref_youid = null;

    try {
      var v = this.gPref.getValue("ext.youid.pref.id");
      if (v)
        pref_youid = JSON.parse(v);
    } catch(e){}

    var sel = pref_youid && pref_youid.id === youid.id;
    var s = this.create_youid_item(youid, sel);
    row.children("td:first").children().remove();
    row.children("td:first").append(s);

    $('.det_btn').not('.click-binded').click(function(e){ self.click_det(e)}).addClass('click-binded');
    $('.youid_chk').not('.click-binded').click(function(e){ self.select_youid_item(e)}).addClass('click-binded');
    $('.uri').not('.click-binded').click(function(e){ self.click_uri(e)}).addClass('click-binded');
    $('.remove_youid').not('.click-binded').click(function(e){ self.click_remove_youid(e)}).addClass('click-binded');
    $('.refresh_youid').not('.click-binded').click(function(e){ self.click_refresh_youid(e)}).addClass('click-binded');
  },

  click_det: function (e)
  {
    var el = $(e.target);
    var det_data = el.parents('table#data').find('tr#det_data');
    var is_visible = det_data.is(":visible");
    if (is_visible) {
      det_data.hide();
      el.attr("src","lib/css/img/plus.png");
    }
    else {
      det_data.show();
      el.attr("src","lib/css/img/minus.png");
    }
    return false;
  },


  select_youid_item: function (e)
  {
    var checked = $(e.target).is(':checked');
    if (checked) {
      var lst = $('.youid_chk');

      for(var i=0; i < lst.length; i++) {
        if (lst[i] !== e.target) {
          lst[i].checked = false;
          var tbl = $(lst[i]).parents('table#data');
          $(tbl).toggleClass("youid_checked", false);
        }
      }

      var tbl = $(e.target).parents('table#data');
      $(tbl).toggleClass("youid_checked", true);

      if (this.is_popup) {
        this.save_youid_data();
        window.close();
      }
    }
    else {
      var tbl = $(e.target).parents('table#data');
      $(tbl).toggleClass("youid_checked", false);
    }

    return true;
  },

  click_uri: function (e)
  {
    var href = $(e.target).attr("href");
    if (href)
      Browser.openTab(href);
  },

  click_remove_youid: function (e)
  {
    var self = this;
    var data = $(e.target).parents('table:first');
    var row = data.parents('tr:first');
    var youid = null;
    try {
      var str = data.attr('mdata');
      youid = $.parseJSON(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid!=null) {
       this.showYN("Do you want to drop YouID item ?",youid.name, function(){
          $(row).remove();
          if (self.is_popup)
            self.save_youid_data();
       });
    }

    return true;
  },

  click_refresh_youid: function (e)
  {
    var self = this;
    var data = $(e.target).parents('table:first');
    var row = data.parents('tr:first');
    var youid = null;
    try {
      var str = data.attr('mdata');
      youid = $.parseJSON(decodeURI(str));
    } catch(e) {
      console.log(e);
    }

    if (youid && youid.id) {
       this.showYN("Do you want to reload YouID item data ?",youid.name, function(){
         self.verify_youid_exec(youid.id, row);
       });
    }

    return true;
  },

  click_add_youid: function ()
  {
    var self = this;
    $( "#add-dlg" ).dialog({
        resizable: false,
        width: 620,
        height:170,
        modal: true,
        buttons: {
          "OK": function() {
            var uri = $('#uri').val().trim();
            $("#add-dlg").dialog( "destroy" );
            self.verify_youid_exec(uri);
          },
          Cancel: function() {
            $("#add-dlg").dialog( "destroy" );
          }
        }
    });

    return false;
  },


  verify_youid_exec: function (uri, row)
  {
    var self = this;
    $( "#verify-dlg" ).dialog({
        resizable: false,
        width: 630,
        height:400,
        modal: true,
        close: function( event, ui ) {
            $("#verify-dlg").dialog("destroy");
        }
    });
    $("#verify_progress").show();
    $("#verify-msg").prop("textContent","");
    $('#verify-data #row').remove();

    var loader = new YouID_Loader(this.showInfo, row);
    loader.verify_ID(uri, function (success, youid, msg, verify_data, row){ self.showVerifyDlg(success, youid, msg, verify_data, row)});
  },


  save_youid_data: function ()
  {
    var pref_youid = "";
    var list = [];
    var rows = $('#youid_list>tr');
    for(var i=0; i < rows.length; i++) {
      var r = $(rows[i]);
      var checked = r.find('#chk').is(':checked');

      var youid = null;
      try {
        var str = r.find('table').attr("mdata");
        youid = $.parseJSON(decodeURI(str));
      } catch(e) {
        console.log(e);
      }

      if (youid) {
         list.push(youid);
         if (checked)
           pref_youid = youid;
      }
    }

    this.gPref.setValue('ext.youid.pref.list', JSON.stringify(list, undefined, 2));
    this.gPref.setValue('ext.youid.pref.id', JSON.stringify(pref_youid, undefined, 2));
  },


  showVerifyDlg: function (success, youid, msg, verify_data, row)
  {
    var self = this;
    if (!$("#verify-dlg").dialog("isOpen")) {
      $("#verify-dlg").dialog("destroy");
      return;
    }

    $("#verify_progress").hide();
    $("#verify-msg").prop("textContent",msg);
    $('#verify-data #row').remove();
    $('#verify-data').append(verify_data);

    $("#verify-dlg").dialog( "option", "buttons",
      [
        {
           text: "OK",
          click: function() {
            if (success) {
              if (row)
                self.updateYouIdItem(row, youid);
              else
                self.addYouIdItem(youid, false);
              if (self.is_popup)
                self.save_youid_data();
            }
            $("#verify-dlg").dialog( "destroy" );
          }
        },
        {
           text: "Cancel",
          click: function() {
            $("#verify-dlg").dialog( "destroy" );
          }
        }
      ]
    );
  },


  showYN: function (msg1, msg2, callback)
  {
    if (msg1)
      $("#alert-msg1").prop("textContent",msg1);
    if (msg2)
      $("#alert-msg2").prop("textContent",msg2);
    $("#alert-dlg").dialog({
      resizable: false,
      height:180,
      width: 400,
      modal: true,
      close: function( event, ui ) {
            $("#alert-dlg").dialog( "destroy" );
        },
      buttons: {
        "No": function() {
          $("#alert-dlg").dialog("destroy");
        },
        "Yes": function() {
          if (callback)
            callback();
          $("#alert-dlg").dialog("destroy");
        }
      }
    });
  },


  showInfo: function (msg)
  {
    $("#verify-dlg").dialog("destroy");

    $("#alert-msg1").prop("textContent",msg);
    $("#alert-dlg" ).dialog({
      resizable: false,
      width: 600,
      height:400,
      modal: true,
      buttons: {
        Cancel: function() {
          $("#alert-dlg").dialog( "destroy" );
        }
      }
    });
  }
}

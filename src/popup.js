/*
 *  This file is part of the OpenLink Structured Data Sniffer
 *
 *  Copyright (C) 2015-2020 OpenLink Software
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

var gPref = null;
var $ = jQuery;
var v_youid = null;


$(document).ready(function()
{
  $("#alert-dlg").hide();
  $("#add-dlg").hide();
  $("#verify-dlg").hide();

  $('#prefs_btn').click(Prefs_exec);

  gPref = new Settings();
  v_youid = new YouId_View(true);

  $('#ext_ver').text('version: '+ Browser.api.runtime.getManifest().version);

  $('a[href="#add_youid"]').click(function(e){v_youid.click_add_youid(e);});

  load_popup();

});


function Prefs_exec()
{
  Browser.openTab("options.html")
  return false;
}

function load_popup()
{
    v_youid.load_youid_list();
}


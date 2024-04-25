/**
 * SEVIS Sign.js
 * Copyright (c) 2023 Michael Shurer and NC State University
 * 
 * This is free for personal use only. 
 * 
 * This code in whole or in part cannot be copied, distributed, or integrated into other software. 
 * 
 * Use of this tool does not guarantee compliance with any regulatory requirements or restrictions.
 * 
 * It is the responsibility of the user of this tool to verify signature status before document distribution. 
 * 
 */
var sevisSign = app.trustedFunction( function (travelSig) { 
    app.beginPriv();
    var fileFound = false;
    try{
        var stmFileData = util.readFileIntoStream(app.getPath("user")+"/Security/sevSignSettings.pdf");
        fileFound = true;
    } catch(e) {
        app.alert("Cannot find settings file. Please use settings update tool and try again.");
    }
    if(fileFound==true){
        var dataStr = util.stringFromStream(stmFileData, "utf-8");
        var data = dataStr.match(/(V\(.+?\))/g);
        var dsoname = data[0].substring(2,data[0].length-1);
        var title = data[1].substring(2,data[1].length-1);
        var location = data[2].substring(2,data[2].length-1);
        var email = data[3].substring(2,data[3].length-1);
        var password = data[4].substring(3,data[4].length-1);
        var saveBehavior = data[5].substring(2,data[5].length-1);
        var F1AppearanceSettings = data[6].substring(2,data[6].length-1);
        var J1AppearanceSettings = data[7].substring(2,data[7].length-1);
        var F1SignForTravel = data[8].substring(2,data[8].length-1);
        var J1SignForTravel = data[9].substring(2,data[9].length-1);
        var autoSign = data[10].substring(2,data[10].length-1);
        //var file = data[11].substring(2,data[11].length-1);
        var F1PrimarySignatureWidth = data[11].substring(2,data[11].length-1)*1;
        var F1PrimarySignatureHeight = data[12].substring(2,data[12].length-1)*1;
        var F1TravelSignatureWidth = data[13].substring(2,data[13].length-1)*1;
        var F1TravelSignatureHeight = data[14].substring(2,data[14].length-1)*1;
        var J1PrimarySignatureWidth = data[15].substring(2,data[15].length-1)*1;
        var J1PrimarySignatureHeight = data[16].substring(2,data[16].length-1)*1;
        var J1TravelSignatureWidth = data[17].substring(2,data[17].length-1)*1;
        var J1TravelSignatureHeight = data[18].substring(2,data[18].length-1)*1;
    }

    var pfx = dsoname.replace(/\s/g, '')+".pfx";

    var file = app.getPath("user") + "/Security/" + pfx;

    if (travelSig==false) {
        var F1SignForTravel ="false";
    }

    var initialCheck = searchWord(0,"INITIAL");
    if (initialCheck==true) {
        var F1SignForTravel ="false";
    }
    console.println(F1SignForTravel);
    var date = new Date();
    var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    var pages = this.numPages
    var sigType = "signature";
    var textType = "text";

    var isEven = pages%2==0;
    console.println(isEven);
    if(isEven==false) {
        var people = (pages + 1) / 4;
        var dsoText = [];
        var titleText = [];
        var placeText = [];
        var dateText = [];
        var sf2 = [];
        var sf = [];
        console.println(people);  
        for( i = 0; i < people ; i++) {
            if (i == 0) {
                var j = 0;
            } else {
                var j = 1;
            }
            var page = 0 + (j * i) + (i * 3);
            var travelPage = 1 + (j * i) + (i * 3);
            var sigName = "sig" + i;
            var travelSigName = "travelSig" + i;
            var dsoFieldName = "dso" + i;
            console.println(dsoFieldName);
            var titleName = "title" + i;
            var dateName = "date" + i;
            var placeName = "location" + i;
            var sigRect = [50,(getQuad(page,"SIGNATURE",1)*1)+F1PrimarySignatureHeight,50+F1PrimarySignatureWidth,getQuad(page,"SIGNATURE",1)-5];
            sf[i] = this.addField(sigName, sigType, page, sigRect);
            if(F1SignForTravel=="true"){
                var travelSigRect = [272,getQuad(travelPage,"SIGNATURE",1)-5,272+F1TravelSignatureWidth,getQuad(travelPage,"SIGNATURE",1)-F1TravelSignatureHeight];
                var DSORect = [35,getQuad(travelPage,"SIGNATURE",1)-5,150,getQuad(travelPage,"SIGNATURE",1)-35];
                var titleRect = [155,getQuad(travelPage,"SIGNATURE",1)-5,250,getQuad(travelPage,"SIGNATURE",1)-35];
                var dateRect = [390,getQuad(travelPage,"SIGNATURE",1)-5,470,getQuad(travelPage,"SIGNATURE",1)-35];
                var placeRect = [480,getQuad(travelPage,"SIGNATURE",1)-5,575,getQuad(travelPage,"SIGNATURE",1)-35];
                dsoText[i] = this.addField(dsoFieldName, textType, travelPage, DSORect);
                dsoText[i].value = dsoname;
                dsoText[i].textColor = color.blue;
                titleText[i] = this.addField(titleName, textType, travelPage, titleRect);
                titleText[i].value = title;
                titleText[i].textColor = color.blue;
                dateText[i] = this.addField(dateName, textType, travelPage, dateRect);
                dateText[i].value = today;
                dateText[i].textColor = color.blue;
                placeText[i] = this.addField(placeName, textType, travelPage, placeRect);
                placeText[i].value = location;
                placeText[i].textColor = color.blue;
                sf2[i] = this.addField(travelSigName, sigType, travelPage, travelSigRect);
            }

        }

        var rec1 = [];
        var copyRect = [];
        var rec2 = [];
        var copyRect2 = [];

        for( i = 0; i < people ; i++) {
            if (i == 0) {
                var j = 0;
            } else {
                var j = 1;
            }
            var page = 0 + (j * i) + (i * 3);
            rec1[i] = this.getField("sig" + i);
            copyRect[i] = rec1[i].rect;
            if(F1SignForTravel=="true"){
                var travelPage = 1 + (j * i) + (i * 3);
                rec2[i] = this.getField("travelSig" + i);
                copyRect2[i] = rec2[i].rect;
            }
        }

        this.flattenPages();

        var sf3 = [];
        var sf4 = [];
        var f = [];
        var f2 = [];

        for( i = 0; i < people ; i++) {
            if (i == 0) {
                var j = 0;
            } else {
                var j = 1;
            }
            var dititalSign = security.getHandler("Adobe.PPKLite");
            dititalSign.login(password, file);
            var page = 0 + (j * i) + (i * 3);
            sf3[i] = this.addField("signame3" + i, sigType, page, copyRect[i]);
            f[i] = this.getField("signame3" + i);
            f[i].textColor = color.blue;
            f[i].signatureSetSeedValue({appearanceFilter: F1AppearanceSettings, flags: 256});
            if(F1SignForTravel=="true"){
                var travelPage = 1 + (j * i) + (i * 3);
                sf4[i] = this.addField("signame4" + i, sigType, travelPage, copyRect2[i]);
                f2[i] = this.getField("signame4" + i);
                f2[i].textColor = color.blue;
                f2[i].signatureSetSeedValue({appearanceFilter: F1AppearanceSettings, flags: 256});
            }
        }

        if (autoSign=="true") {
            for( i = 1; i < people ; i++) {
                var page = 0 + (1 * i) + (i * 3);
                f[i] = this.getField("signame3" + i);
                f[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                f[i].signatureValidate();
                if(F1SignForTravel=="true"){
                    var travelPage = 1 + (1 * i) + (i * 3);
                    f2[i] = this.getField("signame4" + i);
                    f2[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                    f2[i].signatureValidate();
                }
            }

            sigPrime = this.getField("signame30");
            sigPrime.signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
            sigPrime.signatureValidate();
            if(F1SignForTravel=="true"){
                travelPrime = this.getField("signame40");
                travelPrime.signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                travelPrime.signatureValidate();
            }
        }
    } else {
        if (travelSig==false) {
            var J1SignForTravel ="false";
        }
        var initialCheck = searchWord(0,"Begin");
        if(initialCheck==true){
            var J1SignForTravel = "false";
        }
        var people = (pages) / 2;
        if(J1SignForTravel=="true"){
            var dateText = [];
            for( i = 0; i < people ; i++) {       
                var page = (2 * i);
                var dateName = "date" + i;
                var dateRect = [460,(getQuad(page,"Signature",3)*1)+25,570,(getQuad(page,"Signature",3)*1)+50];
                dateText[i] = this.addField(dateName, textType, page, dateRect);
                dateText[i].value = today;
            }
        }


        this.flattenPages();

        var sf3 = [];
        var sf4 = [];
        var f = [];
        var f2 = [];

        for( i = 0; i < people ; i++) {
            var dititalSign = security.getHandler("Adobe.PPKLite");
            dititalSign.login(password, file);
            var page = (2 * i);
            var sigRect = [260,(getQuad(page,"Signature",1)*1)+J1PrimarySignatureHeight,260+J1PrimarySignatureWidth,getQuad(page,"Signature",1)];
            sf3[i] = this.addField("signame3" + i, sigType, page, sigRect);
            f[i] = this.getField("signame3" + i);
            f[i].signatureSetSeedValue({appearanceFilter: J1AppearanceSettings, flags: 256});
            if(J1SignForTravel=="true"){
                var travelSigRect = [425,getQuad(page,"Signature",3),425+J1TravelSignatureWidth,(getQuad(page,"Signature",3)*1)+J1TravelSignatureHeight];
                sf4[i] = this.addField("signame4" + i, sigType, page, travelSigRect);
                f2[i] = this.getField("signame4" + i);
                f2[i].signatureSetSeedValue({appearanceFilter: J1AppearanceSettings, flags: 256});
            }
        }
        if (autoSign=="true"){
            for( i = 0; i < people ; i++) {
                var page = (2 * i);
                f[i] = this.getField("signame3" + i);
                f[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                f[i].signatureValidate();
                if(J1SignForTravel=="true"){
                    f2[i] = this.getField("signame4" + i);
                    f2[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                    f2[i].signatureValidate();
                }
            
            }
        }  
    }

    if(autoSign=="true") {
        if(saveBehavior=="1"){
            app.execMenuItem("Save");
        } else if(saveBehavior=="2"){
            app.execMenuItem ("SaveAs"); 
        } else {
            return false;
        }
    }

    function getQuad(page,searchTerm,instance){
        var found = "false";

        var n = 0;
        var p = page;
        var i = 1;
        while (found == "false") {
            if (this.getPageNthWord(p, n, false).trim() == searchTerm) {
                if (i==instance) {
                    var quads = this.getPageNthWordQuads(p, n);
                    var found = "true";
                }
                i++;
            }
        n++;
        }
        var quadString = quads.toString();
        var quadArray = quadString.split(",");
        return quadArray[1];
        
    }

    function searchWord(page,searchTerm){  
        var found = "false";
        var numWords = this.getPageNumWords(page);
        for (n=0; n < numWords; n++) {
            if (this.getPageNthWord(page, n, false).trim() == searchTerm) {
                var found = "true";
            }
        }
        if (found=="false") {
            return false;
        } else {
            return true;
        }
    }


    app.endPriv();
});

var sevisCopy = app.trustedFunction( function () { 
    app.beginPriv();
    this.saveAs(this.path.replace(".pdf"," copy.pdf"));
    var mark1Text = [];
    var mark2Text = [];
    var mark3Text = [];
    var mark4Text = [];
    for(i=0;i<this.numPages;i++){ 
        mark1Text[i] = this.addField("mark1", "text", i, [245,550,400,650]);
        mark1Text[i].value = "COPY";
        mark1Text[i].textSize = 42;
        mark2Text[i] = this.addField("mark2", "text", i, [208,450,405,550]);
        mark2Text[i].value = "NOT FOR";
        mark2Text[i].textSize = 42;
        mark3Text[i] = this.addField("mark3", "text", i, [212,350,405,450]);
        mark3Text[i].value = "OFFICIAL";
        mark3Text[i].textSize = 42;
        mark4Text[i] = this.addField("mark4", "text", i, [262,250,400,350]);
        mark4Text[i].value = "USE";
        mark4Text[i].textSize = 42;

    }

    var pp = this.getPrintParams();
    pp.interactive = pp.constants.interactionLevel.automatic;
    pp.printerName = "Adobe PDF";
    this.print(pp);

    this.closeDoc(true);
    app.endPriv();
});

var sevSettings = app.trustedFunction( function () { 
    app.beginPriv();
    var settingsFilefound = false;
try{
    var settingsDoc = app.openDoc(app.getPath("user")+"/Security/sevSignSettings.pdf");
    settingsFilefound = true;
    console.println("settingsFileFound:"+settingsFilefound);
} catch(e) {
    settingsFilefound = false;
    console.println("settingsFileFound2:"+settingsFilefound);
}
if(settingsFilefound==false){
    var settingsDoc = app.newDoc();
    settingsDoc.addField("dsoname", "text", 0, [0, 790, 100, 790-1*30]);
    settingsDoc.addField("title", "text", 0, [0, 790-1*30, 100, 790-2*30]);
    settingsDoc.addField("location", "text", 0, [0, 790-2*30, 100, 790-3*30]);
    settingsDoc.addField("email", "text", 0, [0, 790-3*30, 100, 790-4*30]);
    settingsDoc.addField("password", "text", 0, [0, 790-4*30, 100, 790-5*30]);
    settingsDoc.addField("saveBehavior", "text", 0, [0, 790-5*30, 100, 790-6*30]);
    settingsDoc.addField("F1AppearanceSettings", "text", 0, [0, 790-6*30, 100, 790-7*30]);
    settingsDoc.addField("J1AppearanceSettings", "text", 0, [0, 790-7*30, 100, 790-8*30]);
    settingsDoc.addField("F1SignForTravel", "text", 0, [0, 790-8*30, 100, 790-9*30]);
    settingsDoc.addField("J1SignForTravel", "text", 0, [0, 790-9*30, 100, 790-10*30]);
    settingsDoc.addField("autoSign", "text", 0, [0, 790-10*30, 100, 790-11*30]);
    settingsDoc.addField("file", "text", 0, [0, 790, 100-11*30, 790-12*30]);
    settingsDoc.addField("F1PrimarySignatureWidth", "text", 0, [0, 790-12*30, 100, 790-13*30]);
    settingsDoc.addField("F1PrimarySignatureHeight", "text", 0, [0, 790-13*30, 100, 790-14*30]);
    settingsDoc.addField("F1TravelSignatureWidth", "text", 0, [0, 790-14*30, 100, 790-15*30]);
    settingsDoc.addField("F1TravelSignatureHeight", "text", 0, [0, 790-15*30, 100, 790-16*30]);
    settingsDoc.addField("J1PrimarySignatureWidth", "text", 0, [0, 790-16*30, 100, 790-17*30]);
    settingsDoc.addField("J1PrimarySignatureHeight", "text", 0, [0, 790-17*30, 100, 790-18*30]);
    settingsDoc.addField("J1TravelSignatureWidth", "text", 0, [0, 790-18*30, 100, 790-19*30]);
    settingsDoc.addField("J1TravelSignatureHeight", "text", 0, [0, 790-19*30, 100, 790-20*30]);
    settingsDoc.saveAs(app.getPath("user")+"/Security/sevSignSettings.pdf");
    }
   // Dialog Definition 
var oDlg = {
    dsoname : "",
    title : "",
    location : "",
    email : "",
    password : "",
    saveBehavior: "", 
    F1AppearanceSettings: "",
    J1AppearanceSettings: "", 
    F1SignForTravel: "",
    J1SignForTravel: "",
    //file: "",
    F1PrimarySignatureWidth: "",
    F1PrimarySignatureHeight: "",
    F1TravelSignatureWidth: "",
    F1TravelSignatureHeight: "",
    J1PrimarySignatureWidth: "",
    J1PrimarySignatureHeight: "",
    J1TravelSignatureWidth: "",
    J1TravelSignatureHeight: "", 
    initialize: function(dialog) { 
        dialog.load({
            "fd01":this.dsoname,
            "fd02":this.title,
            "fd03":this.location,
            "fd04":this.email,
            "fd05":this.password,
            "fd06":this.saveBehavior+"", 
            "fd07":this.F1AppearanceSettings,
            "fd08":this.J1AppearanceSettings, 
            "fd09":this.F1SignForTravel,
            "fd10":this.J1SignForTravel, 
            "fd11":this.autoSign,
           // "fd12":this.file,
            "fd13":this.F1PrimarySignatureWidth, 
            "fd14":this.F1PrimarySignatureHeight, 
            "fd15":this.F1TravelSignatureWidth,
            "fd16":this.F1TravelSignatureHeight, 
            "fd17":this.J1PrimarySignatureWidth, 
            "fd18":this.J1PrimarySignatureHeight, 
            "fd19":this.J1TravelSignatureWidth, 
            "fd20":this.J1TravelSignatureHeight 
        }); 
    },
    commit: function(dialog) { 
        var data = dialog.store();
        settingsDoc.dsoname = data[ "fd01"];
        settingsDoc.title = data[ "fd02"];
        settingsDoc.location = data[ "fd03"];
        settingsDoc.email = data[ "fd04"];
        settingsDoc.password = data[ "fd05"].toString();
        settingsDoc.saveBehavior  =  data[ "fd06"]+"";
        settingsDoc.F1AppearanceSettings =  data[ "fd07"];
        settingsDoc.J1AppearanceSettings  =  data[ "fd08"];
        settingsDoc.F1SignForTravel =  data[ "fd09"];
        settingsDoc.J1SignForTravel  =  data[ "fd10"];
        settingsDoc.autoSign =  data[ "fd11"];
        //settingsDoc.file =  data[ "fd12"];
        settingsDoc.F1PrimarySignatureWidth  =  data[ "fd13"];
        settingsDoc.F1PrimarySignatureHeight  =  data[ "fd14"];
        settingsDoc.F1TravelSignatureWidth =  data[ "fd15"];
        settingsDoc.F1TravelSignatureHeight  =  data[ "fd16"];
        settingsDoc.J1PrimarySignatureWidth  =  data[ "fd17"];
        settingsDoc.J1PrimarySignatureHeight  =  data[ "fd18"];
        settingsDoc.J1TravelSignatureWidth  =  data[ "fd19"];
        settingsDoc.J1TravelSignatureHeight =  data[ "fd20"];
    },
    description: { 
        name: "sevSign Settings", width: 600, elements: [
            { type: "cluster", name: "Disclaimer", align_children: "align_left", elements: [
                    {type: "view", align_children: "align_row", elements: [
                        { name: "This is free for personal use only and cannot be copied, distributed, or integrated into other software. Use of this tool does not guarantee compliance with any regulatory requirements or restrictions.", alignment: "align_distribute", type: "static_text", }
                        ]
                    }
                 ]
             },
        	{ type: "cluster", name: "Core settings", align_children: "align_left", elements: [
                    {type: "view", align_children: "align_row", elements: [
                            { name: "Name:", alignment: "align_distribute", type: "static_text", },
                            { item_id: "fd01", alignment: "align_distribute", type: "edit_text", char_width: 30 },

                            { name: "title:", type: "static_text", alignment: "align_distribute"},
                            { item_id: "fd02", type: "edit_text", char_width: 30, alignment: "align_distribute" },

                            { name: "location:", type: "static_text", alignment: "align_right"},
                            { item_id: "fd03", type: "edit_text", char_width: 30, alignment: "align_right" }
                        ]
                    },
                    {type: "view", align_children: "align_row", elements: [
                            { name: "email:", type: "static_text", alignment: "align_left"},
                            { item_id: "fd04", type: "edit_text", char_width: 30, alignment: "align_left" },

                            { name: "password:", type: "static_text", alignment: "align_center"},
                            { item_id: "fd05", type: "edit_text", char_width: 30, alignment: "align_center" },
                        ]
                    }
                ]
            },
            { type: "cluster", name: "Advanced settings", align_children: "align_left", elements: [
                  {type: "view", align_children: "align_row", elements: [
                    {type: "view", align_children: "align_row", elements: [
                        { name: "Save Behavior: 1 = Save, 2 = Save As", alignment: "align_distribute", type: "static_text", }
                        ]
                    },

                            { name: "Save Behavior:", type: "static_text", },
                            { item_id: "fd06", type: "edit_text", char_width: 5 },

                            { name: "F1 Appearance Settings:", type: "static_text", },
                            { item_id: "fd07", type: "edit_text", char_width: 30 },

                            { name: "J1 Appearance Settings:", type: "static_text", },
                            { item_id: "fd08", type: "edit_text", char_width: 30 }
                        ]
                    },
                    {type: "view", align_children: "align_row", elements: [

                            { name: "F1 Sign For Travel:", type: "static_text", },
                            { item_id: "fd09", type: "check_box"},

                            { name: "J1 Sign For Travel:", type: "static_text", },
                            { item_id: "fd10", type: "check_box"},				

                            { name: "autoSign:", type: "static_text", },
                            { item_id: "fd11", type: "check_box"}
                        ]
                    },
                   // {type: "view", align_children: "align_row", elements: [
                   //         { name: "file:", type: "static_text", },
				   //         { item_id: "fd12", type: "edit_text", char_width: 30 }
                   //     ]
                   // },
                    { type: "cluster", name: "I-20 Signature settings", align_children: "align_left", elements: [
                            {type: "view", align_children: "align_row", elements: [
                                { name: "Primary Width:", type: "static_text", },
                                { item_id: "fd13", type: "edit_text", char_width: 15 },

                                { name: "Primary Height:", type: "static_text", },
                                { item_id: "fd14", type: "edit_text", char_width: 15 },

                                { name: "Travel Width:", type: "static_text", },
                                { item_id: "fd15", type: "edit_text", char_width: 15 },

                                { name: "Travel Height:", type: "static_text", },
                                { item_id: "fd16", type: "edit_text", char_width: 15 }
                                ]
                            }
                        ]
                    },
                    { type: "cluster", name: "DS-2019 Signature settings", align_children: "align_left", elements: [
                            {type: "view", align_children: "align_row", elements: [
                                { name: "Primary Width:", type: "static_text", },
                                { item_id: "fd17", type: "edit_text", char_width: 15 },

                                { name: "Primary Height:", type: "static_text", },
                                { item_id: "fd18", type: "edit_text", char_width: 15 },

                                { name: "Travel Width:", type: "static_text", },
                                { item_id: "fd19", type: "edit_text", char_width: 15 },

                                { name: "Travel Height:", type: "static_text", },
                                { item_id: "fd20", type: "edit_text", char_width: 15 },
                                ]
                            }
                        ]
                    },
                    { type: "ok_cancel", },
                
			    ]
            }
        ] 
		
    }
};


if(settingsFilefound==false){
// Dialog Activation 
    oDlg.dsoname = "Full Name";
    oDlg.title = "Title";
    oDlg.location = "Athens, GA";
    oDlg.email = "@uga.edu";
    oDlg.password = "oie@uga";
    oDlg.saveBehavior = "1";
    oDlg.F1AppearanceSettings = "Signature";
    oDlg.J1AppearanceSettings = "Signature";
    oDlg.F1SignForTravel = true;
    oDlg.J1SignForTravel = true;
    oDlg.autoSign = true;
   // oDlg.file = "default";
    oDlg.F1PrimarySignatureWidth = 270;
    oDlg.F1PrimarySignatureHeight = 20;
    oDlg.F1TravelSignatureWidth = 113;
    oDlg.F1TravelSignatureHeight = 35;
    oDlg.J1PrimarySignatureWidth = 160;
    oDlg.J1PrimarySignatureHeight = 25;
    oDlg.J1TravelSignatureWidth = 145;
    oDlg.J1TravelSignatureHeight = 25;
}
if(settingsFilefound==true){
    console.println("settingsFileFound3:"+settingsFilefound);
    oDlg.dsoname = settingsDoc.getField("dsoname").value;
    oDlg.title = settingsDoc.getField("title").value;
    oDlg.location = settingsDoc.getField("location").value;
    oDlg.email = settingsDoc.getField("email").value;
    var passwordString = settingsDoc.getField("password").value.toString();
    var pwrdStr = passwordString.substring(1,passwordString.length);
    oDlg.password = pwrdStr;
    oDlg.saveBehavior = settingsDoc.getField("saveBehavior").value;
    oDlg.F1AppearanceSettings = settingsDoc.getField("F1AppearanceSettings").value;
    oDlg.J1AppearanceSettings = settingsDoc.getField("J1AppearanceSettings").value;
    oDlg.F1SignForTravel = settingsDoc.getField("F1SignForTravel").value;
    oDlg.J1SignForTravel = settingsDoc.getField("J1SignForTravel").value;
    oDlg.autoSign = settingsDoc.getField("autoSign").value;
   // oDlg.file = settingsDoc.getField("file").value;
    oDlg.F1PrimarySignatureWidth = settingsDoc.getField("F1PrimarySignatureWidth").value;
    oDlg.F1PrimarySignatureHeight = settingsDoc.getField("F1PrimarySignatureHeight").value;
    oDlg.F1TravelSignatureWidth = settingsDoc.getField("F1TravelSignatureWidth").value;
    oDlg.F1TravelSignatureHeight = settingsDoc.getField("F1TravelSignatureHeight").value;
    oDlg.J1PrimarySignatureWidth = settingsDoc.getField("J1PrimarySignatureWidth").value;
    oDlg.J1PrimarySignatureHeight = settingsDoc.getField("J1PrimarySignatureHeight").value;
    oDlg.J1TravelSignatureWidth = settingsDoc.getField("J1TravelSignatureWidth").value;
    oDlg.J1TravelSignatureHeight = settingsDoc.getField("J1TravelSignatureHeight").value;
}

if( "ok" == app.execDialog(oDlg)) {  
    settingsDoc.getField("dsoname").value = settingsDoc.dsoname;
    settingsDoc.getField("title").value = settingsDoc.title;
    settingsDoc.getField("location").value = settingsDoc.location;
    settingsDoc.getField("email").value = settingsDoc.email;
    settingsDoc.getField("password").value = "$"+settingsDoc.password.toString();
    settingsDoc.getField("saveBehavior").value = settingsDoc.saveBehavior;
    settingsDoc.getField("F1AppearanceSettings").value = settingsDoc.F1AppearanceSettings;
    settingsDoc.getField("J1AppearanceSettings").value = settingsDoc.J1AppearanceSettings;
    settingsDoc.getField("F1SignForTravel").value = settingsDoc.F1SignForTravel;
    settingsDoc.getField("J1SignForTravel").value = settingsDoc.J1SignForTravel;
    settingsDoc.getField("autoSign").value = settingsDoc.autoSign;
    //settingsDoc.getField("file").value = settingsDoc.file;
    settingsDoc.getField("F1PrimarySignatureWidth").value = settingsDoc.F1PrimarySignatureWidth;
    settingsDoc.getField("F1PrimarySignatureHeight").value = settingsDoc.F1PrimarySignatureHeight;
    settingsDoc.getField("F1TravelSignatureWidth").value = settingsDoc.F1TravelSignatureWidth;
    settingsDoc.getField("F1TravelSignatureHeight").value = settingsDoc.F1TravelSignatureHeight;
    settingsDoc.getField("J1PrimarySignatureWidth").value = settingsDoc.J1PrimarySignatureWidth;
    settingsDoc.getField("J1PrimarySignatureHeight").value = settingsDoc.J1PrimarySignatureHeight;
    settingsDoc.getField("J1TravelSignatureWidth").value = settingsDoc.J1TravelSignatureWidth;
    settingsDoc.getField("J1TravelSignatureHeight").value = settingsDoc.J1TravelSignatureHeight;
    settingsDoc.saveAs(app.getPath("user")+"/Security/sevSignSettings.pdf");
    settingsDoc.closeDoc(true);  
}
    app.endPriv();
});

var icNewDocSm = 
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c3800C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff77767600C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28ff876807ff77767600C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ceff777676fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff77767600C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ff9a968aff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ffcda733fff2ca28fff2ca28ffcda733ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38fff2ca28fff2ca28ffcda733ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff876807fff2ca28ffcda733ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff777676ffcda733fff2ca28ff3e3c38ff99999900C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38fff2ca28ff6b530aff99999900C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff81640bff876807ff99999900C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff999999ff6b530aff9a968a00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ff9a968affd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0";

var icNewDocSm2 = 
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c3800C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C0ff000000ff00000000C0C0C000C0C0C0ff9a968aff000000ff000000fff2ca28fff2ca28ff000000ff000000ff00000000C0C0C000C0C0C0ff000000ff00000000C0C0C0ff000000ff000000"+
"ff000000ff000000ff000000ff000000ffd5d4ceff000000ff000000fff2ca28ff000000fff2ca28ff000000ff000000ff3e3c38ff000000ff3e3c38ff000000ff000000ff777676ff000000ff000000"+
"ff000000ff00000000C0C0C0ff000000ff9a968aff000000ff000000fff2ca28ff000000fff2ca28ff000000ff000000fff2ca28ff000000fff2ca28ff876807ff00000000C0C0C0ff00000000C0C0C0"+
"ff000000ff00000000C0C0C0ffd5d4ceff777676ff000000ff000000fff2ca28ff000000fff2ca28ff000000ff000000fff2ca28ff000000ffcda733ff777676ff000000ff000000ff00000000C0C0C0"+
"ff000000ff00000000C0C0C0ff9a968aff3e3c38ff000000ff000000ff3e3c38ff000000ff3e3c38ff000000ff000000ff000000ffcda733ff3e3c38ffd5d4ceff000000ff00000000C0C0C000C0C0C0"+
"ff000000ff00000000C0C0C000C0C0C000C0C0C0ff000000ff00000000C0C0C0ff000000ff3e3c38ff000000ff000000ffcda733ff3e3c38ffd5d4ce00C0C0C0ff000000ff00000000C0C0C000C0C0C0"+
"ff000000ff00000000C0C0C0ff00000000C0C0C0ff000000ff00000000C0C0C0ff000000ff876807ff000000ff000000ff3e3c38ffd5d4ce00C0C0C000C0C0C0ff000000ff00000000C0C0C000C0C0C0"+
"ff000000ff000000ff000000ff00000000C0C0C0ff000000ff000000ff000000ff777676ffcda733ff000000ff000000ff99999900C0C0C000C0C0C000C0C0C0ff000000ff00000000C0C0C000C0C0C0"+
"00C0C0C0ff000000ff00000000C0C0C000C0C0C000C0C0C0ff000000ff000000ff3e3c38fff2ca28ff000000ff00000000C0C0C000C0C0C000C0C0C000C0C0C0ff000000ff00000000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff81640bff876807ff99999900C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff999999ff6b530aff9a968a00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ff9a968affd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0";

var icNewDocSm3 = 
"00C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c3800C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff3e3c38ff3e3c38ff3e3c38ff3e3c38ffd2d2d2ffd2d2d2ffd2d2d200C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28ffd2d2d2ffd2d2d2fff2ca28fff2ca28ff5b5b5bff000000ff5b5b5b00C0C0C000C0C0C0ffd2d2d2ffd2d2d200C0C0C0"+
"ffd5d4ceff777676fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28ffd2d2d2ff5b5b5bff000000ffd2d2d2ffcda733ff444444ff000000ff44444400C0C0C0ffd2d2d2ff000000ff5b5b5bffd2d2d2"+
"ff9a968aff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ffd2d2d2ff000000ff000000ff444444ff000000ff000000ff000000ff000000ff000000ff444444ff000000ff000000ffd2d2d2"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38fff2ca28ffd2d2d2ff444444ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff444444ffd2d2d200C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff876807fff2ca28ffcda733ff000000ff000000ff000000ffd2d2d200C0C0C0ffd2d2d2ff000000ff000000ff00000000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff777676ffd2d2d2ff5b5b5bff444444ff000000ff000000ffd2d2d200C0C0C000C0C0C000C0C0C0ffd2d2d2ff000000ff000000ff444444ff5b5b5b"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ffd2d2d2ff000000ff000000ff000000ff00000000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff000000ff000000ff000000ff000000"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff81640bffd2d2d2ff5b5b5bff444444ff000000ff000000ffd2d2d200C0C0C000C0C0C000C0C0C0ffd2d2d2ff000000ff000000ff444444ff5b5b5b"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff999999ff6b530aff9a968a00C0C0C000C0C0C0ff000000ff000000ff000000ffd2d2d2ffd2d2d2ffd2d2d2ff000000ff000000ff00000000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ff9a968affd5d4ce00C0C0C0ffd2d2d2ff444444ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff444444ffd2d2d200C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ffd5d4ce00C0C0C0ffd2d2d2ff000000ff000000ff444444ff000000ff000000ff000000ff000000ff000000ff444444ff000000ff000000ffd2d2d2"+
"00C0C0C000C0C0C000C0C0C0ff3e3c38ffd5d4ce00C0C0C000C0C0C0ffd2d2d2ff5b5b5bff00000000C0C0C000C0C0C0ff444444ff000000ff44444400C0C0C000C0C0C0ff000000ff5b5b5bffd2d2d2"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C0ffd2d2d2ffd2d2d200C0C0C000C0C0C0ff5b5b5bff000000ff5b5b5b00C0C0C000C0C0C0ffd2d2d2ffd2d2d200C0C0C0";

var icNewDocSm4 = 
"00C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c3800C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff87680700C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C0ffd5d4ceff3e3c38fff2ca28fff2ca28fff2ca28fff2ca28ffcda733ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff77767600C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"00C0C0C0ff9a968affcda733fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28ff876807ff77767600C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0"+
"ffd5d4ceff777676fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff2ca28fff5d0d0fffa8181fffa818100C0C0C000C0C0C000C0C0C0fff5d0d0fffa8181fffa818100C0C0C0"+
"ff9a968aff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ff3e3c38ffcda733fff2ca28fff2ca28fffcaaaafffa1919fffa1919fffcaaaa00C0C0C000C0C0C0fffa1919fffa1919fffa1919fff5d0d0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38fff2ca28fff2ca28ffcda733fff5d0d0fffa8181fffa1919fffa1919fffcaaaafffcaaaafffa1919fffa1919fffa8181fff5d0d0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff876807fff2ca28ffcda733ff3e3c38ffd5d4ce00C0C0C0fffa1919fffa1919fffa1919fffa1919fffa1919fffa5252fff5d0d000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff777676ffcda733fff2ca28ff3e3c38ff99999900C0C0C000C0C0C000C0C0C0fffa1919fffa1919fffa1919fffa191900C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38fff2ca28ff6b530aff99999900C0C0C000C0C0C000C0C0C000C0C0C0fffa1919fffa1919fffa1919fffa191900C0C0C000C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ffd5d4ceff81640bff876807ff99999900C0C0C000C0C0C000C0C0C000C0C0C0fffa8181fffa1919fffa1919fffa1919fffa1919fffcaaaa00C0C0C000C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff999999ff6b530aff9a968a00C0C0C000C0C0C000C0C0C000C0C0C0fffcaaaafffa1919fffa1919fffa5252fffa5252fffa1919fffa1919fffcaaaa00C0C0C0"+
"00C0C0C000C0C0C000C0C0C000C0C0C0ff3e3c38ff9a968affd5d4ce00C0C0C000C0C0C000C0C0C0fff5d0d0fffa1919fffa1919fffa5252fff5d0d0fff5d0d0fffa1919fffa1919fffa5252fff5d0d0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ceff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C0fffcaaaafffa1919fffa1919fffcaaaa00C0C0C000C0C0C0fffcaaaafffa1919fffa1919fffcaaaa"+
"00C0C0C000C0C0C000C0C0C0ff3e3c38ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0fff5d0d0fffcaaaafffcaaaa00C0C0C000C0C0C000C0C0C000C0C0C0fffcaaaafffcaaaafff5d0d0"+
"00C0C0C000C0C0C000C0C0C0ffd5d4ce00C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C000C0C0C0";

var oIconNewDocument = {count: 0, width: 20, height: 20,
read: function(nBytes){return icNewDocSm.slice(this.count, this.count += nBytes);}};

var oIconNewDocument2 = {count: 0, width: 20, height: 20,
    read: function(nBytes){return icNewDocSm2.slice(this.count, this.count += nBytes);}};

var oIconNewDocument3 = {count: 0, width: 20, height: 20,
    read: function(nBytes){return icNewDocSm3.slice(this.count, this.count += nBytes);}};

var oIconNewDocument4 = {count: 0, width: 20, height: 20,
    read: function(nBytes){return icNewDocSm4.slice(this.count, this.count += nBytes);}};

app.addToolButton({
    cName: "SEVIS Sign",
    cLabel: "sevSign",
    cExec: "sevisSign(true)",
    cTooltext: "Sign I-20 or DS-2019",
    cEnable: true,
    nPos: 0,
    oIcon: oIconNewDocument
});

app.addToolButton({
    cName: "SEVIS Copy",
    cLabel: "sevCopy",
    cExec: "sevisCopy()",
    cTooltext: "Sign I-20 or DS-2019",
    cEnable: true,
    nPos: 0,
    oIcon: oIconNewDocument2
});

app.addToolButton({
    cName: "SEVIS Settings",
    cLabel: "sevSettings",
    cExec: "sevSettings()",
    cTooltext: "Sign I-20 or DS-2019",
    cEnable: true,
    nPos: 0,
    oIcon: oIconNewDocument3
});

app.addToolButton({
    cName: "SEVIS Sign - No Travel",
    cLabel: "noTravel",
    cExec: "sevisSign(false)",
    cTooltext: "Sign I-20 or DS-2019 (No Travel)",
    cEnable: true,
    nPos: 0,
    oIcon: oIconNewDocument4
});

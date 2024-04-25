/**
 * SEVIS Sign.js
 * Copyright (c) 2024 Michael Shurer and NC State University
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
    var signed = false;
    try{
        var stmFileData = util.readFileIntoStream(app.getPath("user")+"/Security/sevSignSettings.pdf");
        fileFound = true;
    } catch(e) {
        app.alert("Cannot find settings file. Please use settings update tool and try again.");
    }
    if(fileFound){
        try{
            console.println("attempting signature");
            var dataStr = util.stringFromStream(stmFileData, "utf-8");
            var data = dataStr.match(/(V\(.+?\))/g);
            if(data.length < 20){
                console.println("tool not yet upgraded");
                stmFileData = null;
                app.alert("To complete the upgrade, you must run the settings tool again");
                return;
            }
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
            var F1PrimarySignatureWidth = data[11].substring(2,data[11].length-1)*1;
            var F1PrimarySignatureHeight = data[12].substring(2,data[12].length-1)*1;
            var F1TravelSignatureWidth = data[13].substring(2,data[13].length-1)*1;
            var F1TravelSignatureHeight = data[14].substring(2,data[14].length-1)*1;
            var J1PrimarySignatureWidth = data[15].substring(2,data[15].length-1)*1;
            var J1PrimarySignatureHeight = data[16].substring(2,data[16].length-1)*1;
            var J1TravelSignatureWidth = data[17].substring(2,data[17].length-1)*1;
            var J1TravelSignatureHeight = data[18].substring(2,data[18].length-1)*1;
            var date = new Date();
            var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
            var dsoPadded = padText(dsoname,24);
            var locationPadded = padText(location,20);
            var titlePadded = padText(title,20);
            var todayPadded = padText(today,18);
            var pages = this.numPages
            var isEven = pages%2==0;
            try {
            var fileOverride = data[19].substring(2,data[19].length-1);
            } catch(e) {
                app.alert("Signature Wizard update incomplete. Please record your password and other settings and delete the configuration file found here: \n\n"+app.getPath("user")+"/Security/sevSignSettings.pdf\n\nOnce you have deleted the configurations file you must click the settings button again (bolt with gear) to reenter your signature settings.")
            }
            if(password==""){
                password = app.response({cQuestion: "Enter Signature Password", cTitle: "Password not found", bPassword: true, cLabel: "Password"})
            }
            var pfx = dsoname.replace(/\s/g, '')+".pfx";
            var file = app.getPath("user") + "/Security/" + pfx;
            if(fileOverride!="default.pfx"){
                file = app.getPath("user") + "/Security/" + fileOverride;
            }
            try {
                console.println("attempting to login using file: "+file);
                var dititalSign = security.getHandler("Adobe.PPKLite");
                    dititalSign.login(password, file);
            } catch(e) {
                app.alert("Cannot find certificate file or the password is incorrect. Please confirm you are using the correct password in the settings configurations and confirm that the following file exists: \n\n"+file+"\n\nIf your digital certificate is named something other than "+pfx+" you can override the filename in the settings configurations page.");
                return
            } 
            console.println("login successful");  
            if (travelSig==false) {
                var F1SignForTravel ="false";
            }
            var sigType = "signature";
            var textType = "text";
            var page = 0;
            var sigCount = 0;
            console.println("checking doctype");
            if(searchWord(page,"SCHOOL",25)) {
                console.println("F-1 document found");
                var initialCheck = searchWord(0,"INITIAL",this.getPageNumWords(0));
                if (initialCheck==true) {
                    var F1SignForTravel ="false";
                }
                var dsoText = [];
                var titleText = [];
                var placeText = [];
                var dateText = [];               
                for( i = 0; i < pages ; i++) {
                    if(searchWord(i,"TRAVEL",25)) {
                        page = i;        
                        var dsoFieldName = "dso" + page;
                        var titleName = "title" + page;
                        var dateName = "date" + page;
                        var placeName = "location" + page;
                        var sigTextStart = getQuad(page,"SIGNATURE",1)*1;
                        if(F1SignForTravel=="true"){
                            var DSORect = [35,sigTextStart-5,150,sigTextStart-35];
                            var titleRect = [155,sigTextStart-5,250,sigTextStart-35];
                            var dateRect = [390,sigTextStart-5,470,sigTextStart-35];
                            var placeRect = [480,sigTextStart-5,575,sigTextStart-35];
                            dsoText[i] = this.addField(dsoFieldName, textType, page, DSORect);
                            dsoText[i].value = dsoPadded;
                            dsoText[i].textColor = color.blue;
                            titleText[i] = this.addField(titleName, textType, page, titleRect);
                            titleText[i].value = titlePadded;
                            titleText[i].textColor = color.blue;
                            dateText[i] = this.addField(dateName, textType, page, dateRect);
                            dateText[i].value = todayPadded;
                            dateText[i].textColor = color.blue;
                            placeText[i] = this.addField(placeName, textType, page, placeRect);
                            placeText[i].value = locationPadded;
                            placeText[i].textColor = color.blue;              
                        }        
                    }
                }
                this.flattenPages();
                var f = [];
                var sigName = "";
                var sigRect = [0,0,0,0];
                for( i = 0; i < pages ; i++) {
                    page = i
                    if(searchWord(page,"SCHOOL",10)) {
                        sigName = "sig" + sigCount;
                        sigRectStart = getQuad(page,"SIGNATURE",1)*1;
                        sigRect = [50,sigRectStart+F1PrimarySignatureHeight,50+F1PrimarySignatureWidth,sigRectStart-5];
                        f[i] = this.addField(sigName, sigType, page, sigRect);
                        f[i].textColor = color.blue;
                        f[i].signatureSetSeedValue({appearanceFilter: F1AppearanceSettings, flags: 256});
                        sigCount++;
                    } else if(searchWord(page,"TRAVEL",50)) {
                        if(F1SignForTravel=="true"){
                            sigName = "sig" + sigCount;
                            sigRectStart = getQuad(page,"SIGNATURE",1)*1;
                            sigRect = [272,sigRectStart-5,272+F1TravelSignatureWidth,sigRectStart-F1TravelSignatureHeight];
                            f[i] = this.addField(sigName, sigType, page, sigRect);
                            f[i].textColor = color.blue;
                            f[i].signatureSetSeedValue({appearanceFilter: F1AppearanceSettings, flags: 256});
                            sigCount++;
                        }
                    }
                }
        
                if (autoSign=="true") {
                    console.println("autoSign: " + autoSign)
                    for( i = 0; i < sigCount ; i++) {         
                        f[i] = this.getField("sig" + i);
                        f[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                    }
                }
                dititalSign.logout();
            } else if(isEven) {
                console.println("J-1 document found");
                if (!travelSig) {
                    J1SignForTravel = false;
                }
                console.println("checking initial doctype");
                var initialCheck = searchWord(0,"Begin",this.getPageNumWords(0));
                if(initialCheck){
                    console.println("initial doctype found");
                    J1SignForTravel = false;
                }
                console.println("checking j-1 travel signature eligibility");
                if(J1SignForTravel){
                    console.println("J-1 travel signature eligibility found");
                    var dateText = [];
                    for( i = 0; i < pages ; i++) { 
                        if(i%2==0) {     
                            var dateName = "date" + i;
                            var dateRect = [444,190,540,215];
                            console.println("[460,163.5,570,213.5]")
                            console.println("date "+i+" [460,"+(getQuad(i,"Signature",3)*1)+25+",570,"+(getQuad(i,"Signature",3)*1)+50+"]");
                            dateText[i] = this.addField(dateName, textType, i, dateRect);
                            dateText[i].value = today;
                            console.println("dateblock "+i+" added")
                        }
                    }
                }
        
                this.flattenPages();
                
                var f = [];
                var f2 = [];
                var sf = [];
                var sigCount = 0;
                var sigName = "";
                var sigRect = [0,0,0,0];
                for( i = 0; i < pages; i++) {
                    if(i%2==0) {   
                        depOffset = 0;
                        if(i==0){
                            depOffset = 2.23;
                        }
                        sigName = "sig" + sigCount;
                        console.println("adding signature block: "+sigName+ " page: " + i + "total pages: " + pages)
                        var sigRect = [260,325,260+(1*J1PrimarySignatureWidth),325+(1*J1PrimarySignatureHeight)];
                        f[i] = this.addField(sigName, sigType, i, sigRect);
                        f[i].signatureSetSeedValue({appearanceFilter: J1AppearanceSettings, flags: 256});
                        sigCount++;
                        if(J1SignForTravel){
                            var travelSigName = "sig" + sigCount;
                            var travelSigRect = [425,163.6,425+(1*J1TravelSignatureWidth),163.6+J1TravelSignatureHeight];
                            f2[i] = this.addField(travelSigName, sigType, i, travelSigRect);
                            f2[i].textColor = color.blue;
                            f2[i].signatureSetSeedValue({appearanceFilter: J1AppearanceSettings, flags: 256});
                            sigCount++;
                        }
                    }
                }
                if (autoSign=="true") {    
                    console.println("autoSign: " + autoSign)
                    for( i = 0; i < sigCount ; i++) {           
                        sf[i] = this.getField("sig" + i);
                        sf[i].signatureSign( dititalSign, {password: password, location: location, reason: "I am approving this document", contactInfo: email});
                        var saveBehavior = data[5].substring(2,data[5].length-1);
                        var autoSign = data[10].substring(2,data[10].length-1);
                        try {
                            if(autoSign=="true") {
                                console.println("saving: " + i)
                                if(saveBehavior=="1"){
                                    app.execMenuItem("Save");
                                } else if(saveBehavior=="2"){
                                    app.execMenuItem ("SaveAs"); 
                                } else {
                                    return false;
                                }
                            }
                        } catch (e) {
                            app.alert("Save failed. Please try again.");
                        }
                    }
                } 
                
            }
            signed = true;

        } catch(e) {
            console.println(e);
            app.alert("Signature failed. Please try again.");
        } 

        if(signed){
            var saveBehavior = data[5].substring(2,data[5].length-1);
            var autoSign = data[10].substring(2,data[10].length-1);
            try {
                if(autoSign=="true") {
                    if(saveBehavior=="1"){
                        app.execMenuItem("Save");
                    } else if(saveBehavior=="2"){
                        app.execMenuItem ("SaveAs"); 
                    } else {
                        return false;
                    }
                }
                app.alert("File Saved",3);
            } catch (e) {
                app.alert("Save failed. Please try again.");
            }
            
        }   
    }

    function getQuad(page,searchTerm,instance){
        var found = false;
        var n = 0;
        var p = page;
        var i = 1;
        while (!found) {
            if (this.getPageNthWord(p, n, false).trim() == searchTerm) {
                if (i==instance) {
                    var quads = this.getPageNthWordQuads(p, n);
                    var found = true;
                }
                i++;
            }
        n++;
        }
        var quadString = quads.toString();
        var quadArray = quadString.split(",");
        return quadArray[1];    
    }

    function searchWord(page,searchTerm,numWords){  
        var found = false;
        console.println("searching for: " + searchTerm );
        for (n=0; n < numWords; n++) {
            try {
                if (this.getPageNthWord(page, n, false).trim() == searchTerm) {
                    var found = true;
                }
            } catch(e) {
                return false;
            }
        }
        if (!found) {
            return false;
        } else {
            return true;
        }
    }

    function padText(inputString,maxLen){  
        var inputLen = inputString.length;
        for (i=0; i<=maxLen-inputLen; i++) {
            inputString = inputString+" ";
        }
        return inputString;
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
    try{
      settingsDoc.getField("fileOverride").value;
    }
    catch(e) {
        console.println("attempting upgrade");
        settingsDoc.addField("fileOverride", "text", 0, [0, 790-20*30, 100, 790-21*30]).value = "default.pfx";
        settingsDoc.getField("fileOverride").value = "default.pfx";
        settingsDoc.getField("fileOverride").textColor = color.white;
        settingsDoc.saveAs(app.getPath("user")+"/Security/sevSignSettings.pdf");
        settingsDoc.closeDoc(true);  
        app.alert("Upgrade complete");
        return;
    }
    settingsFilefound = true;
    console.println("settingsFileFound:"+settingsFilefound);
} catch(e) {
    settingsFilefound = false;
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
    settingsDoc.addField("fileOverride", "text", 0, [0, 790-20*30, 100, 790-21*30]);
    settingsDoc.saveAs(app.getPath("user")+"/Security/sevSignSettings.pdf");
    }
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
    F1PrimarySignatureWidth: "",
    F1PrimarySignatureHeight: "",
    F1TravelSignatureWidth: "",
    F1TravelSignatureHeight: "",
    J1PrimarySignatureWidth: "",
    J1PrimarySignatureHeight: "",
    J1TravelSignatureWidth: "",
    J1TravelSignatureHeight: "", 
    J1TravelSignatureHeight: "",
    fileOverride: "", 
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
            "fd13":this.F1PrimarySignatureWidth, 
            "fd14":this.F1PrimarySignatureHeight, 
            "fd15":this.F1TravelSignatureWidth,
            "fd16":this.F1TravelSignatureHeight, 
            "fd17":this.J1PrimarySignatureWidth, 
            "fd18":this.J1PrimarySignatureHeight, 
            "fd19":this.J1TravelSignatureWidth, 
            "fd20":this.J1TravelSignatureHeight,
            "fd21":this.fileOverride
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
        settingsDoc.F1PrimarySignatureWidth  =  data[ "fd13"];
        settingsDoc.F1PrimarySignatureHeight  =  data[ "fd14"];
        settingsDoc.F1TravelSignatureWidth =  data[ "fd15"];
        settingsDoc.F1TravelSignatureHeight  =  data[ "fd16"];
        settingsDoc.J1PrimarySignatureWidth  =  data[ "fd17"];
        settingsDoc.J1PrimarySignatureHeight  =  data[ "fd18"];
        settingsDoc.J1TravelSignatureWidth  =  data[ "fd19"];
        settingsDoc.J1TravelSignatureHeight =  data[ "fd20"];
        settingsDoc.fileOverride =  data[ "fd21"];
    },
    description: { 
        name: "sevSign Settings", width: 600, elements: [
            { type: "cluster", name: "Disclaimer", align_children: "align_left", elements: [
                    {type: "view", align_children: "align_row", elements: [
                        { name: "This cannot be distributed or integrated into other software. Use of this tool does not guarantee compliance with any regulatory requirements or restrictions.", alignment: "align_distribute", type: "static_text", }
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
                            { item_id: "fd05", type: "edit_text", char_width: 30, alignment: "align_center" , password: true},
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
                    {type: "view", align_children: "align_row", elements: [
                            { name: "Filename override:", type: "static_text", },
				            { item_id: "fd21", type: "edit_text", char_width: 30 }
                        ]
                    },
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
    oDlg.dsoname = "Michael Scott";
    oDlg.title = "Regional Manager";
    oDlg.location = "Scranton, PA";
    oDlg.email = "mscott@dundermifflin.com";
    oDlg.password = "12345";
    oDlg.saveBehavior = "2";
    oDlg.F1AppearanceSettings = "Signature";
    oDlg.J1AppearanceSettings = "Signature";
    oDlg.F1SignForTravel = true;
    oDlg.J1SignForTravel = true;
    oDlg.autoSign = true;
    oDlg.fileOverride = "default.pfx";
    oDlg.F1PrimarySignatureWidth = 170;
    oDlg.F1PrimarySignatureHeight = 20;
    oDlg.F1TravelSignatureWidth = 113;
    oDlg.F1TravelSignatureHeight = 35;
    oDlg.J1PrimarySignatureWidth = 160;
    oDlg.J1PrimarySignatureHeight = 25;
    oDlg.J1TravelSignatureWidth = 145;
    oDlg.J1TravelSignatureHeight = 25;
    
}
if(settingsFilefound==true){
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
    oDlg.fileOverride = settingsDoc.getField("fileOverride").value;
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
    settingsDoc.getField("dsoname").textColor = color.white;
    settingsDoc.getField("title").value = settingsDoc.title;
    settingsDoc.getField("title").textColor = color.white;
    settingsDoc.getField("location").value = settingsDoc.location;
    settingsDoc.getField("location").textColor = color.white;
    settingsDoc.getField("email").value = settingsDoc.email;
    settingsDoc.getField("email").textColor = color.white;
    settingsDoc.getField("password").value = "$"+settingsDoc.password.toString();
    settingsDoc.getField("password").textColor = color.white;
    settingsDoc.getField("saveBehavior").value = settingsDoc.saveBehavior;
    settingsDoc.getField("saveBehavior").textColor = color.white;
    settingsDoc.getField("F1AppearanceSettings").value = settingsDoc.F1AppearanceSettings;
    settingsDoc.getField("F1AppearanceSettings").textColor = color.white;
    settingsDoc.getField("J1AppearanceSettings").value = settingsDoc.J1AppearanceSettings;
    settingsDoc.getField("J1AppearanceSettings").textColor = color.white;
    settingsDoc.getField("F1SignForTravel").value = settingsDoc.F1SignForTravel;
    settingsDoc.getField("F1SignForTravel").textColor = color.white;
    settingsDoc.getField("J1SignForTravel").value = settingsDoc.J1SignForTravel;
    settingsDoc.getField("J1SignForTravel").textColor = color.white;
    settingsDoc.getField("autoSign").value = settingsDoc.autoSign;
    settingsDoc.getField("autoSign").textColor = color.white;
    settingsDoc.getField("F1PrimarySignatureWidth").value = settingsDoc.F1PrimarySignatureWidth;
    settingsDoc.getField("F1PrimarySignatureWidth").textColor = color.white;
    settingsDoc.getField("F1PrimarySignatureHeight").value = settingsDoc.F1PrimarySignatureHeight;
    settingsDoc.getField("F1PrimarySignatureHeight").textColor = color.white;
    settingsDoc.getField("F1TravelSignatureWidth").value = settingsDoc.F1TravelSignatureWidth;
    settingsDoc.getField("F1TravelSignatureWidth").textColor = color.white;
    settingsDoc.getField("F1TravelSignatureHeight").value = settingsDoc.F1TravelSignatureHeight;
    settingsDoc.getField("F1TravelSignatureHeight").textColor = color.white;
    settingsDoc.getField("J1PrimarySignatureWidth").value = settingsDoc.J1PrimarySignatureWidth;
    settingsDoc.getField("J1PrimarySignatureWidth").textColor = color.white;
    settingsDoc.getField("J1PrimarySignatureHeight").value = settingsDoc.J1PrimarySignatureHeight;
    settingsDoc.getField("J1PrimarySignatureHeight").textColor = color.white;
    settingsDoc.getField("J1TravelSignatureWidth").value = settingsDoc.J1TravelSignatureWidth;
    settingsDoc.getField("J1TravelSignatureWidth").textColor = color.white;
    settingsDoc.getField("J1TravelSignatureHeight").value = settingsDoc.J1TravelSignatureHeight;
    settingsDoc.getField("J1TravelSignatureHeight").textColor = color.white;
    settingsDoc.getField("fileOverride").value = settingsDoc.fileOverride;
    settingsDoc.getField("fileOverride").textColor = color.white;
    try{
        settingsDoc.saveAs(app.getPath("user")+"/Security/sevSignSettings.pdf");
    } catch (e) {
        app.alert("Unable to save settings. Please close out of Acrobat and reopen it to run the settings tool again.");
        return;
    }
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

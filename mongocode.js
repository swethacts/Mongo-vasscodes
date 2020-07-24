var express = require('express');
var router = express.Router();
var authRouter = require('../../authRouter');
var async = require('async');
//var JiraAppNew =require('../../models/jiraAppNew');
var qTestCases = require('../../models/qtestcase');
var testlogs = require('../../models/testlog');

let executionTrend ={
	sprint: null,
	sit_Count: null,
	uat_count: null,
	prod_count: null,
	totalTestCaseCount: null
}

let executionTrendArray=[];

function setExecutionTrend(_sprint,_sit_Count,_uat_count,_prod_count,_totalTestCaseCount){
	this.sprint =_sprint,
	this.sitCount=_sit_Count,
	this.uat_count=_uat_count,
	this.prod_count=_prod_count,
	this.totalTestCaseCount=_totalTestCaseCount
}


let executionDetails ={
	sprint:null,
	compontent:null,
	testCaseId:null,
	sit_executing:null,
	uat_executing:null,
	prod_executing:null
}

var executionDetailsArray=[];

function setExecutionDetails(_sprint,_component,_testCaseId,_sit_executing,_uat_executing,_prod_executing){
	this.sprint=_sprint,
	this.compontent=_component,
	this.testCaseId=_testCaseId,
	this.sit_executing=_sit_executing,
	this.uat_executing=_uat_executing,
	this.prod_executing=_prod_executing
}

var todayDate= new Date().toISOString().split('T')[0];
var startDate = todayDate-30;

async function getIterationList(lob, project){
    return new Promise (function (resolve , reject){
    qTestCases.distinct("NTS_Sprint", { lob:  {"$eq": lob } , "NTS_Sprint": {
    "$ne": null
    } }, function(err, doc) {
    if(err) {console.log(err); reject(err)}
    else{
    console.log("Review 1-->"+  doc);
    resolve (doc);
    }
    
    });
});
}

async function getTestCaseIds(project,sprintName, stDate,endDate){

		return new Promise (function (resolve , reject){
			qTestCases.distinct("pid", { NTS_Sprint:  
						{"$eq": sprintName } , 
						jirakey:  {"$eq": project } 
					}, function(err, doc) {
						if(err) {console.log(err); reject(err)}
				else{
					console.log("Inside getTestCaseIds-->"+ doc);	
					console.log("TotalTestCaseCount-->"+doc.length);
					resolve (doc);	 
				}
				
			});
		});
}
async function getDistinctTestCasesExecutedByEnv(env,testCaseIDList,stDate,endDate){
	return new Promise (function (resolve , reject){
		console.log("getDistinctTestCasesExecutedByEnv")
		testlogs.distinct("testCaseId", { testCaseId:  {"$in": testCaseIDList } , executedEnv: {"$eq": env}, "timestamp": {
			"$gte": new Date(stDate +"T00:00:01.001Z"),
			"$lte": new Date(endDate +"T00:00:01.001Z")
		}}, function(err, doc) {
			if(err) {console.log(err); reject(err)}
			else{
				console.log("getDistinctTestCasesExecutedByEnv-->"+"------"+ doc);	
				resolve (doc.length);	 
			}
			
		});
	});
}


async function getExecutionDetails(env,testCaseIDList,stDate,endDate){
	return new Promise (function (resolve , reject){		
		testlogs.distinct("testCaseId", { testCaseId:  {"$in": testCaseIDList } , executedEnv: {"$eq": env}, "timestamp": {
			"$gte": new Date(stDate +"T00:00:01.001Z"),
			"$lte": new Date(endDate +"T00:00:01.001Z")
		}}, function(err, doc) {
			if(err) {console.log(err); reject(err)}
			else{
				console.log("getExecutionDetails-->---------"+env+"++++++++++++++++++++++++++++++"+ doc);	

				resolve (doc);	 
			}
			
		});
	});
}

async function getExecutionSummary(lob, project, stDate, endDate){
	return new Promise (async function (resolve , reject){	
	var sprintList;	 
	let getIterationListObj =await getIterationList(lob,project);	 
	sprintList =  getIterationListObj ;
	console.log("-------sprintList"+sprintList);
	console.log("sprintList-->"+ typeof sprintList +sprintList[1]);	 
	for(let i=0 ;i<=sprintList.length; i++){ 
		if(sprintList[i]!=null){
			//let exeTrend=new executionTrend() ;
			var testCaseIDList;
			let testCaselstObj =await getTestCaseIds(project,sprintList[i], stDate,endDate);
			var testCaseIDList =testCaselstObj;			
			executionTrend.totalTestCaseCount=testCaseIDList.length;
			var sitCount = 0;
			var uatCount = 0;
			sitCount= await getDistinctTestCasesExecutedByEnv("SIT", testCaseIDList,stDate, endDate);
			uatCount= await getDistinctTestCasesExecutedByEnv("UAT", testCaseIDList,stDate, endDate);
			prodCount= await getDistinctTestCasesExecutedByEnv("PROD", testCaseIDList,stDate, endDate);
			let exuectionInfo = new setExecutionTrend(sprintList[i],sitCount,uatCount,prodCount,testCaseIDList.length);
			executionTrendArray.push(exuectionInfo);	 
		}
		
	}; 
	console.log("2.....inside-getExecutionSummary------------**************--------->"+JSON.stringify(executionTrendArray));
	resolve (executionTrendArray);
	});	
};

router.route('/iteration').get(function(req, res) { 
	console.log("Test1111");
	qTestCases.find({ NTS_Sprint: '1F PI-5.5'} , function(err, doc) {
		if(doc){
			console.log(doc); 
		}
		if(err){
			console.log("Abin's arror")
			console.log(err);
			return res.status(500).send(err);
		} 
		return res.json(doc);
	});
});

/*
get Execution Summary by lob and Project id 

*/
router.route('/getExecutionsummary').post( function(req, res) {
	var data = req.body;		
	console.log("lob is -->"+ data['lob']);
	console.log("project is -->"+data['projectId'])
	var stDate="2020-02-01";
	var endDate="2020-06-01";
	 getExecutionSummary(data['lob'], data['projectId'] ,stDate,endDate).then(function (response)
	 {
		return res.json(response);
	 } )
	
});

router.route('/getExecutionDetails').post( function(req, res) {
	var data = req.body;		
	console.log("lob is -->"+ data['lob']);
	console.log("project is -->"+data['projectId'])
	var stDate="2020-02-01";
	var endDate="2020-06-01";
	console.log("Execution Details....");
	 getexecutionDetails(data['lob'], data['projectId'] ,stDate,endDate).then(function (response)
	 {
		return res.json(response);
	 } )
	
});

//Get testcase Id details New API service
router.route('/gettestCaseIdDetails').post( function(req, res) {
	var data = req.body;
	testlogs.aggregate([{$match:{"testCaseId" :  data['testCaseId'] }},
								{ $sort: { "timestamp" : -1 } },
								{ $limit: 25	},
								{ "$project": {
								"_id": 0,
								"testCaseId": 1,
								"status": 1 ,	
								"executedEnv": 1,
								"timestamp": 1,								
								}}], function(err, doc) {
										if(doc){
										//console.log(doc); 
										}
										if(err){
										//console.log(doc)
										console.log(err);
										return res.status(500).send(err);
										} 		
										//resolve (doc);
										return res.json(doc);
									});	
});

//getExecutionDetailsExecutionSummury total grid and graph
router.route('/getExecutionDetailsExecutionSummury').post( function(req, res) {		
	var data = req.body;
	var stDate = data['stDate'];
	var endDate= data['endDate'];
	var Components =  data['Components'];
    //preare grid and graph
	 getExecutionDetailsExecutionSummury(data['lob'], data['appId'] ,data['Components'], stDate,endDate,data['artflag']).then(function (response)
	 {
		return res.json(response);
	 } )
	
});

async function getexecutionDetails(lob, project, stDate, endDate){
	return new Promise (async function (resolve , reject){	
	var sprintList;	 
	var distinctTestCaselst;
	var distinctTestCaselst_UAT;
	let getIterationListObj =await getIterationList(lob,project);	 
	sprintList =  getIterationListObj ;
	for(let i=0 ;i<=sprintList.length; i++){ 
		if(sprintList[i]!=null){
			//let exeTrend=new executionTrend() ;
			var testCaseIDList;
			let testCaselstObj =await getTestCaseIds(project,sprintList[i], stDate,endDate);
			var testCaseIDList =testCaselstObj;			
	 
			let distinctTestCaselstObj = await getExecutionDetails("SIT",testCaseIDList,stDate,endDate);
			distinctTestCaselst = distinctTestCaselstObj;
			//Get Component list based on testcase IDS
			var getComponentsList;
			let getComponentsObj =await getComponentId(distinctTestCaselst,project,sprintList[i], stDate,endDate);
			var getComponentsList =getComponentsObj; 
			//End
			for(let j=0; j<=distinctTestCaselst.length;j++){
				//dispaly component 
				let _com = null;			
				if(getComponentsList[j]){
					try{					
					let _temp =  JSON.parse(JSON.stringify(getComponentsList[j]));					
					_com = _temp['Components']&& _temp['Components'][0]?_temp['Components'][0]:null;
					}catch(e){
						console.log("Parse error ",e);
					}
				}
				//End
				let _executiondet = new setExecutionDetails(sprintList[i],_com,distinctTestCaselst[j],"true","","");
				executionDetailsArray.push(_executiondet);
			}		
			let distinctTestCaselstObj_UAT = await getExecutionDetails("UAT",testCaseIDList,stDate,endDate);	 
			distinctTestCaselst_UAT =distinctTestCaselstObj_UAT;
			//Get Component list based on testcase IDS
			var getComponentsListUAT;
			let getComponentsObjUAT =await getComponentId(distinctTestCaselst_UAT,project,sprintList[i], stDate,endDate);
			var getComponentsListUAT =getComponentsObjUAT; 
			//End
			for(let j=0; j<=distinctTestCaselst_UAT.length;j++){
				//Uat component Display
				let _comUAT = null;			
				if(getComponentsListUAT[j]){
					try{
					let _tempUAT =  JSON.parse(JSON.stringify(getComponentsListUAT[j]));
					_comUAT = _tempUAT['Components']&& _tempUAT['Components'][0]?_tempUAT['Components'][0]:null;
					}catch(e){
						console.log("Parse error ",e);
					}
				}
				//End
				let _executiondet_uat = new setExecutionDetails(sprintList[i],_comUAT,distinctTestCaselst_UAT[j],"","true","");
				    pushToArrayIfKeyNotExist(executionDetailsArray,_executiondet_uat);
			}
		}		
	}; 
	console.log("2.....inside-getExecutionSummary------------**************--------->"+JSON.stringify(executionDetailsArray));
	resolve (executionDetailsArray);
	});	
};

 function pushToArrayIfKeyNotExist(executionDetailsArray,_data){
	var index = executionDetailsArray.findIndex(x => x.testCaseId==_data.testCaseId)
	// here you can check specific property for an object whether it exist in your array or not	 
	if (index>-1){		 
			executionDetailsArray[index].uat_executing="true";
	}
	else {
		executionDetailsArray.push(_data);	 
	}
}

function getDistinctSprint(req, res){
	qTestCases.distinct("NTS_Sprint", { lob:  {"$eq": data['lob'] } }, function(err, doc) {
		if(err) return res.status(500).send(err);
		return res.json(doc.sort());
	});
}

//Get Componets Based on testcaseIDS
async function getComponentId(testCaseIDList,project,sprintName, stDate,endDate){
	return new Promise (function (resolve , reject){
		console.log('NTS_Sprint: {"$eq": '+sprintName+' } ,jirakey:  {"$eq": '+project+' } ,pid:  {"$in": '+testCaseIDList +'}},{"Components":1}');
		qTestCases.find({ NTS_Sprint:  
			{"$eq": sprintName } , 
			jirakey:  {"$eq": project } ,
			pid:  {"$in": testCaseIDList }
		},{"Components":1,"_id":0}, function(err, doc) {
		if(err) {console.log(err); reject(err)}
		else{
			console.log("Inside Components-->"+ doc);	
			console.log("ComponentsCount-->"+doc.length);
			resolve (doc);	 
		}
		});
	});
}

//prepare grid and graph array
let ExecutionTotalArray=[];
async function getExecutionDetailsExecutionSummury(lob,appId,Components, stDate, endDate,ArtFlag){
	ExecutionTotalArray = [];
	return new Promise (async function (resolve , reject){	
	var sprintList;
	let getIterationListObj =await getExecutionDetailsExecutionSummuryquery(lob,appId,Components,stDate,endDate,ArtFlag);
	//Assign to sprint list
	sprintList =  getIterationListObj;
	//Sort sprint list 
	sprintList.sort(getSortOrder ("sprint"));
    //Prepare graph results array
	let tempSprint;	 
	let uatCount=0;
	let sitCount=0;
	let prodCount=0;
	let sprintCountArray=[];
	const unique = [...new Set(sprintList.map(item => item.sprint))];
		for( let i = 0; i < unique.length ; i++ ) {
			tempSprint = sprintList.filter(t => t.sprint === unique[i]);
			uatcount = tempSprint.filter(c => c.uat_executing === true).length;
			sitcount = tempSprint.filter(c => c.sit_executing === true).length;
			prodcount = tempSprint.filter(c => c.prod_executing === true).length;
			//Push all values into sprintCountArray
			sprintCountArray.push({
			'sprint' : unique[i] , 	 
			'sitCount' : sitcount ,
			'uat_count' : uatcount ,
			'prod_count' : prodcount,
			'totalTestCaseCount' :tempSprint.length});
		}
	console.log(sprintCountArray);	
    //Combine grid results and graph results
	ExecutionTotalArray.push({"grid": sprintList ,"graph" : sprintCountArray} );
	resolve (ExecutionTotalArray);
	});	
};

//With  params & with out params getExecutionDetailsExecutionSummuryquery
async function getExecutionDetailsExecutionSummuryquery(lob,appId,Components,stDate,endDate,ArtFlag){
	// Initial data 
	var Components = (Components != 'null') ? Components.split(',') : null;

	var lob = lob.split(',');
    // split string on comma space
	var appId = (appId != 'null') ? appId.split(',') : null;
	console.log(lob)
	console.log(Components);
	console.log(appId);
	//Prepare dymamic request based on params
	let request;
		//ArtFlag == 'YES'
		if(ArtFlag == 'YES' ) {
			if(Components == null) {
				request = [{"lob" : {"$in": lob } } ,
				{"totalSprint":  "Automated" } , 
				{"test_logs.timestamp": {
				"$gte": new Date(stDate +"T00:00:01.001Z"),
				"$lte": new Date(endDate +"T00:00:01.001Z")
				}}]
			}else {
					//Added Regular Expresstion
					 Components = Components.map(function (e) {					 
					 //var lastWord = e.match(/\w+$/)[0];
					 //lastWord = lastWord.slice(2);
                     var lastWord = e.substring(0, 5);					 
					 //lastWord =  lastWord.toLowerCase();
					 //lastWord = lastWord.slice(1)+'$';
					 //lastWord = lastWord.substring(lastWord.length-4, lastWord.length);
					return new RegExp(lastWord,  "i");
                     //return new RegExp(lastWord,"m"); 					
					});
				console.log(Components);
				request = [{"lob" : {"$in": lob } } ,
				{"totalSprint":  "Automated" } ,  
				{"Components" :{"$in": Components } },
				{"test_logs.appId" : {"$in": appId } } ,			
				{"test_logs.timestamp": {
				"$gte": new Date(stDate +"T00:00:01.001Z"),
				"$lte": new Date(endDate +"T00:00:01.001Z")
				}}]
			}
		}
		//ArtFlag == 'NO'
		if(ArtFlag == 'NO' ) {
			if(appId == null) {
				request = [{"lob" : {"$in": lob } } ,
				{"totalSprint":  "Automated" } , 
				{"test_logs.timestamp": {
				"$gte": new Date(stDate +"T00:00:01.001Z"),
				"$lte": new Date(endDate +"T00:00:01.001Z")
				}}]
			}else {		
				request = [{"lob" : {"$in": lob } } ,
				{"totalSprint":  "Automated" } ,  
				{"test_logs.appId" : {"$in": appId } } ,			
				{"test_logs.timestamp": {
				"$gte": new Date(stDate +"T00:00:01.001Z"),
				"$lte": new Date(endDate +"T00:00:01.001Z")
				}}]
			}
		}

    //db query to prere results
	return new Promise (function (resolve , reject){
		qTestCases.aggregate([{	$lookup:{
								from: "test_logs",       
								localField: "pid",   
								foreignField: "testCaseId", 
								as: "test_logs"         
								}},
								{$unwind:"$test_logs"},
								{$match:{$and:request},},
								{ "$group": {
								"_id": { "pid": "$pid",
								"Components": "$Components" ,
								"appId" : "$test_logs.appId" ,
								"lob" : "$lob" ,
								"totalSprint" : "$totalSprint" ,
								"NTS_Sprint" :"$NTS_Sprint"},
								"tcount": { "$sum": 1 ,  },
								ttags: { $push:  { ttags: "$test_logs.executedEnv" } },
								}},
								// Unwind twice because "ttags" is now an array of arrays
								{ "$unwind": "$ttags" },
								{ "$unwind": "$ttags" },
								// Now use $addToSet to get the distinct values        
								{ "$group": {
								"_id": "$_id",
								"tcount": { "$first": "$tcount" },
								"tags": { "$addToSet": "$ttags.ttags" }
								}},
								// Optionally $project to get the fields out of the _id key
								{ "$project": {
								"_id": 0,
								"sprint": "$_id.NTS_Sprint",
								"Components": { $arrayElemAt: [ "$_id.Components", 0 ] },	
								"testCaseId": "$_id.pid",
								"appId": "$_id.appId",
								"uat_executing" : { $in: [ "UAT", "$tags" ]}	,
								"sit_executing" : { $in: [ "SIT", "$tags" ]}	,
								"prod_executing" : { $in: [ "PROD", "$tags" ]}	,	  
								"executedEnv": "$tags",	
								"count": "$tcount" ,  
								"lob" : "$_id.lob",
								"totalSprint" : "$_id.totalSprint"
								}}
								]).allowDiskUse(true) 
								.exec((err, doc) => {
									if(err){
										//console.log(doc)
										console.log(err);
										return res.status(500).send(err);
									} 		
									resolve (doc);
								});
	});
	
}

//Sort Sprint List
function getSortOrder(prop) {
	return function (a, b) {
		if (a[prop] > b[prop]) {
			return -1;
		} else if (a[prop] < b[prop]) {
			return 1;
		}
		return 0;
	}
}
module.exports = {router, authRouter};

 

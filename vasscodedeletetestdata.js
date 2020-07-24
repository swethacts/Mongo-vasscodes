------------------------3gis Componet File -------------------------
//Using polygon
	async DeleteTestData(page, request) {
		try {
			var coordinateX = request.body.coordinateX;
			var coordinateY = request.body.coordinateY;
			var coordinateStartPoint = request.body.coordinateStartPoint;

			//login to 3GIS
			await threeGisAction.threeGISLoginPage(page, request);

			//navigate to smartmarks location
			await threeGisAction.navigateToSmartmarks(page, request);

			//Delete Test Data
			await BrowserAction.wait(3, request);
			// select Selection tool
			await BrowserAction.clickShadowRootByIndexNproperty(page, request, "#actionbarContainer > paper-item", "firstElementChild", 2);
			// await this.clickShadowRootByIndexfirstElementChild(page, request, "#actionbarContainer > paper-item", 2);
			await rp.sendLog('INFO', "after selecting Selection tool", request);

			await BrowserAction.wait(5, request);
			// select Selection on Map
			await this.dragDropShadowRootByparentNodeUsingCordinates(page, request, "#mapContainerDiv_zoom_slider > div.threegis-nav-button.esriSimpleSliderDecrementButton > span", ">",  coordinateStartPoint, coordinateX, coordinateY);
			await rp.sendLog('INFO', "after Selection on map", request);
		    //Delete Test Data
            await threeGisAction.DeleteTestdata(page, request);	
			await rp.endExecution(page, request, 'PASSED', {});
		} catch (error) {
			await rp.sendLog('ERROR', `Delete Test Data main method with error: ${error}`, request);
			await rp.endExecution(page, request, 'FAILED', {
			error: error.message
			});
		}
	}
	//Using polygon longtude and latitude
	async DeleteTestDatausingCordinates(page, request) {
		try {
			var coordinateX = request.body.coordinateX;
			var coordinateY = request.body.coordinateY;
			var coordinateStartPoint = request.body.coordinateStartPoint;

			//login to 3GIS
			await threeGisAction.threeGISLoginPage(page, request);
		
            await BrowserAction.wait(3, request);
			
			await threeGisAction.CoordinatesSearch(page, request);
			await BrowserAction.wait(3, request);
			//Delete Test Data
            await threeGisAction.DeleteTestdata(page, request);				
			

			await BrowserAction.wait(5, request);
		
			await rp.sendLog('INFO', "after Delition", request);
		
			await rp.endExecution(page, request, 'PASSED', {});
		} catch (error) {
			await rp.sendLog('ERROR', `Delete Test Data main method with error: ${error}`, request);
			await rp.endExecution(page, request, 'FAILED', {
			error: error.message
			});
		}
	}
    ------------------------3gis actions File -------------------------
	
	//Enter Longitude and Lattude values usng search selection to open a info panel
	async CoordinatesSearch(page, request) {

        var lattitude = request.body.lattitude;
		var longitude = request.body.longitude;
		//var longitude = "-"+longitudes;
		var buffersize = request.body.buffersize;	

        //FQN ID search
        await this.findElementByIconNameAndClick(page, request, "#icon", 'search');
        await browserAction.takeScreenshot(page, request, 'selectSearchIcon', 'png');
        await rp.sendLog('INFO', "after clicking Search", request);

        await this.findElementByTextAndClick(page, request, "#paper-input-label-1", 'Search Type');
        await browserAction.takeScreenshot(page, request, 'selectSearchType', 'png');
        await rp.sendLog('INFO', "after clicking Search Type", request);
        
        await this.findElementByTextAndClick(page, request, ".search", 'Search By Coordinates');
        await browserAction.takeScreenshot(page, request, 'Search By Coordinates', 'png');
        await rp.sendLog('INFO', "after Selecting Search By Coordinates Search", request);
        
       await page.keyboard.press('Tab'); 
       await page.keyboard.press('Tab'); 
      
	   await page.keyboard.press('Tab'); 
	   await page.keyboard.type(lattitude);
	   await page.keyboard.press('Tab'); 
	   await page.keyboard.type(longitude);
	   await page.keyboard.press('Tab'); 
	   await page.keyboard.press('Tab'); 
	   await page.keyboard.type(buffersize);
       await browserAction.takeScreenshot(page, request, 'Cordinates typed', 'png');	
       await page.keyboard.press('Enter');
	   await browserAction.wait(4, request);
	   
	}
	//Delete test dat afer opening the info Panel
	async DeleteTestdata(page, request) {
	   
	  var loopcount = request.body.loopcount;
	   
	   for(let i = 1; i <= loopcount; i++) {
	   
	
		 const searchbutton = (await page.waitForFunction(() => {
			const searchbutton = querySelectorShadowDom.querySelectorDeep("#layerDiv");
			return searchbutton;
			})).asElement();
			await searchbutton.click({
                button: 'right'
            });
			console.log('Layer Div box clicked');	 
			
			await browserAction.wait(3, request);
			console.log('str');
			const outputSpan = await page.evaluateHandle(() => querySelectorShadowDom.querySelectorDeep("#rightClickMenu"));
			const rightclick = await page.evaluate((output) => output.innerText, outputSpan);
			console.log(rightclick);
			var rightclickvalue = rightclick.includes("Delete All");
			console.log(rightclickvalue);
			if(rightclickvalue === true) {		
                 console.log('entered value is true');	
                //#rightClickLayerMenu > paper-item:nth-child(2)			 
				await this.clickShadowRootByIdInnerText(page, request, "#rightClickLayerMenu > paper-item:nth-child(2)", 'Delete All');
				 const searchbutton1 = (await page.waitForFunction(() => {
				const searchbutton1 = querySelectorShadowDom.querySelectorDeep("div > div.self-end.button-div > div > paper-button:nth-child(4)");
				return searchbutton1;
				})).asElement();
				await searchbutton1.click(); 
				 console.log('searchbutton1 clicked');
				 await browserAction.wait(6, request);
				await this.threeGISCommitButton(page, request);
			} else { 
			    //#rightClickLayerMenu > paper-item:nth-child(1)
				await this.clickShadowRootByIdInnerText(page, request, "#rightClickLayerMenu > paper-item:nth-child(1)", 'Remove All from Selection Set');
			
			}
			
	   }
			
		console.log("right element cicked");

	   await browserAction.wait(3, request);
	   
    }
	 ------------------------3gis Controller  File -------------------------
	 DeleteTestData(req, res) {
        threeGisService.DeleteTestData(req).then(r =>
            res
            .status(201)
            .location(`/api/v1/execution/${r.id}`)
            .json(r)
        );
    }
	DeleteTestDatausingCordinates(req, res) {
        threeGisService.DeleteTestDatausingCordinates(req).then(r =>
            res
            .status(201)
            .location(`/api/v1/execution/${r.id}`)
            .json(r)
        );
    }
	 ------------------------3gis Router  File -------------------------
	router.post('/cn/DeleteTestData', executionHandler, threeGisController.DeleteTestData);
	router.post('/cn/DeleteTestDatausingCordinates', executionHandler, threeGisController.DeleteTestDatausingCordinates);
	
	------------------------3gis Service  File -------------------------
	
	DeleteTestData(request) {
        const response = request.execution;
        PuppeteerCluster._cluster.queue(
            async ({
                page
            }) => threeGisComponent.DeleteTestData(page, request)
        );
        return Promise.resolve(response);
    }
	DeleteTestDatausingCordinates(request) {
        const response = request.execution;
        PuppeteerCluster._cluster.queue(
            async ({
                page
            }) => threeGisComponent.DeleteTestDatausingCordinates(page, request)
        );
        return Promise.resolve(response);
    }
	
	------------------------Common api.yml   File (While placing the codemake sure indetaion is correct) -------------------------
	
  /3gis/cn/DeleteTestData:
    post:
      tags:
      - 3gis
      description: "Create Complements"
      parameters: *GLOB_PARAMS
      requestBody:
        description: Building Request Body
        content:
          application/json:
            schema:
              $ref: './swagger/threegis.yml#/components/schemas/DeleteTestData'
        required: true
      responses: *GLOB_RESPONSES
  /3gis/cn/DeleteTestDatausingCordinates:
    post:
      tags:
      - 3gis
      description: "Create Complements"
      parameters: *GLOB_PARAMS
      requestBody:
        description: Building Request Body
        content:
          application/json:
            schema:
              $ref: './swagger/threegis.yml#/components/schemas/DeleteTestDatausingCordinates'
        required: true
      responses: *GLOB_RESPONSES
	  
	  ------------------------Swagger threegis.Yml File (While placing the codemake sure indetaion is correct)-------------------------
	 DeleteTestData:
      title: DeleteTestData
      type: object
      properties:
        smartmarks:
          type: string
          description: Provide Smartmarks Name
          example: newcn1       
        coordinateX:
          type: integer
          description: Provide span X coordinates
          example: 750
        coordinateY:
          type: integer
          description: Provide span Y coordinates
          example: 450
        coordinateStartPoint:
          type: integer
          description: Provide span coordinate starting point
          example: 100 
        loopcount:
          type: integer
          description: Provide Loop Count
          example: 4
    DeleteTestDatausingCordinates:
      title: DeleteTestDatausingCordinates
      type: object
      properties:
        lattitude:
          type: string
          description: Provide Lattitude
          example: 35.732071       
        longitude:
          type: string
          description: Provide longitude
          example: -86.58636
        buffersize:
          type: string
          description: Provide buffersize
          example: 320
        loopcount:
          type: string
          description: Provide Provide Loop Count
          example: 4
	  
	  
	

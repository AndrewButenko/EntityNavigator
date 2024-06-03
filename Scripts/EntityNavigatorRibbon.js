var AB = AB || {};
AB.EntityNavigatorRibbon = (function () {
    async function initialize() {
        //Checking if the pane is already initialized
        var pane = Xrm.App.sidePanes.getPane("EntityNavigator");

        //If the pane is already initialized, we don't need to do anything, just return false
        if (pane) {
            return false;
        }

        //If the pane is not initialized, we will initialize it
        //this function will run asynchronously because initialization
        //might take more than allowed 10 seconds thresshold
        initializePane();

        //returning false to hide the trigget button
        return false;
    }

    //Function to initialize the pane
    async function initializePane(){
        //Creating the pane
        var pane = await Xrm.App.sidePanes.createPane({
            title: "Entity Navigator",
            imageSrc: "WebResources/ab_/EntityNavigator/icon.svg",
            paneId: "EntityNavigator",
            canClose: false,
            width: 400
        });

        //Once pane is created, code navigates it to the webresource
        pane.navigate({
            pageType: "webresource",
            webresourceName: "ab_/EntityNavigator/index.html"
        });

        //Collapsing the pane by default
        Xrm.App.sidePanes.state = 0;
    }

    return {
        initialize: initialize
    };
})();
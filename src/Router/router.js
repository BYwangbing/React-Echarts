import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import App from "../App";
import Relation from "../components/Relation/Relation";
import RelationY from "../components/Relation/RelationY";

const BasicRoute = () => (
    <BrowserRouter>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route exact path="/relate" component={Relation}/>
            <Route exact path="/relateY" component={RelationY}/>
        </Switch>
    </BrowserRouter>
);


export default BasicRoute;
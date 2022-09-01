import React from 'react';
import { 
    BrowserRouter, 
    useRoutes 

} from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const App = () =>{
    let routes = useRoutes( [
        { path: "/", element: <Home/> },
        { path: "/create-point", element: <CreatePoint /> }
    ] )
    return routes;
}

const RoutesApp = () =>{
    return(
        <BrowserRouter>
            <App />
        </BrowserRouter>
    )
    
}

export default RoutesApp;
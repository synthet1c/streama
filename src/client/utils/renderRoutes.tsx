import { Route, Switch } from 'react-router';
import React, { Fragment } from 'react';

export interface IRoute {
  path: string|string[]
  exact?: boolean
  guard?: any
  component?: any
  layout?: any
  routes?: IRoute[]
}

export const renderRoutes = (routes: IRoute[]): any => {
  return (
    <Switch>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            render={(props) => (
              <Guard>
                <Layout>
                  {route.routes
                    ? renderRoutes(route.routes)
                    : <Component {...props} />}
                </Layout>
              </Guard>
            )}
          />
        );
      })}
    </Switch>
  )

}

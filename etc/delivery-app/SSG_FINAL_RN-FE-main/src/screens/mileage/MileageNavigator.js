import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../Dashboard';
import CouponList from './CouponList';

const Drawer = createDrawerNavigator();

function MileageNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dashboard">
        <Drawer.Screen name="Dashboard" component={Dashboard} />
        <Drawer.Screen name="CouponList" component={CouponList} />
        {/* 필요한 다른 화면들을 여기에 추가 */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default MileageNavigator;
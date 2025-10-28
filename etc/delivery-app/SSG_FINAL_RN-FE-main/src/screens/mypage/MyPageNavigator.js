import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import Dashboard from '../Dashboard';
import MyECO from './MyECO';
// ... 필요한 다른 컴포넌트 import

const Drawer = createDrawerNavigator();

function MyPageNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Dashboard">
        <Drawer.Screen name="Dashboard" component={Dashboard} />
        <Drawer.Screen name="MyECO" component={MyECO} />
        {/* 필요한 다른 화면들을 여기에 추가 */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default MyPageNavigator;
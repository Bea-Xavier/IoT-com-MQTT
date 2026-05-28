import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import CircularProgress from 'react-native-circular-progress-indicator'

export default function Gauges({ temp, hum }) {
    return (
        <View style={styles.row}>
            <View style={styles.gaugeBox}>
                <CircularProgress
                value={temp}
                radius={60}
                title={'°C'}
                titleColor={'#FFF'}
                activeStrokeColor={'#e74c3c'}
                inActiveStrokeColor={'#2c3e50'}
                textColor={'#fff'}
                />
                <Text style={styles.label}>Temperatura</Text>
            </View>

            <View style={styles.gaugeBox}>
                <CircularProgress
                value={hum}
                radius={60}
                title={'%'}
                titleColor={'#FFF'}
                activeStrokeColor={'#3498db'}
                inActiveStrokeColor={'#2c3e50'}
                textColor={'#fff'}
                />
                <Text style={styles.label}>Umidade</Text>
            </View>
        </View>
    )
} 

const styles = new StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    gaugeBox: {
        backgroundColor: '#1e1e1e',
        padding: 15,
        borderRadius: 20, 
        alignItems: 'center',
        width: '48%',
    },
    label: {
        color: '#aaa',
        marginTop: 10,
        fontSize: 14
    }
})
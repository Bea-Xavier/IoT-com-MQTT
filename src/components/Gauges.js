import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';

export default function Gauges({ temp, hum }){
    return (
        <View style={styles.row}>
            <View style={styles.gaugesBox}>
                <CircularProgress
                    value={temp}
                    radius={60}
                    tittle={'°C'}
                    titleColor={'#FFF'}
                    activeStrokeColor={'#E74C3C'}
                    inActiveStrokeColor={'#2C3E50'}
                    textColor={'#FFF'}
                />
                <Text style={styles.label}>Temperatura</Text>
            </View>

            <View style={styles.gaugesBox}>
                <CircularProgress
                    value={hum}
                    radius={60}
                    tittle={'%'}
                    titleColor={'#FFF'}
                    activeStrokeColor={'#3498DB'}
                    inActiveStrokeColor={'#2C3E50'}
                    textColor={'#FFF'}
                />
                <Text style={styles.label}>Umidade</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', 
        width: '100%',
    },
    gaugesBox: { backgroundColor: '#1E1E1E', padding: 15,
        borderRadius: 20, alignItems: 'center', width: '48%',
    },
    label: { color: '#AAA', marginTop: 10,
        fontSize: 14,
    },
});
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons'

export default function LightControl({ isLightOn, onToggle }) {
    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={onToggle}>
                <Icon
                    name={isLightOn ? 'lightbulb-on' : 'lightbulb-outline'}
                    size={100}
                    color={isLightOn ? '#F1C40F' : '#555'}
                />
            </TouchableOpacity>
            <Text style={styles.label}>
                {isLightOn ?
                    'Luz Ligada'
                    :
                    'Luz Desligada'
                }
            </Text>
        </View>
    )
}

const styles = new StyleSheet.create({
    card: {
        backgroundColor: '#1e1e1e',
        padding: 30, 
        borderRadius: 20, 
        alignItems: 'center',
        width: '100%',
        marginBottom: 20
    },
    label: {
        color: '#AAA',
        marginTop: 10,
        fontSize: 14
    }
})
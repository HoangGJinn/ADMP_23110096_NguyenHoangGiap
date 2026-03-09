import { BorderRadius, DiscordColors, FontSizes, Spacing } from '@/constants/discord-theme';
import { UpdateProfileRequest } from '@/services/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: UpdateProfileRequest) => Promise<void>;
    currentData: {
        displayName?: string;
        bio?: string;
        avatarUrl?: string;
        pronouns?: string;
        country?: string;
        birthDate?: string;
    };
}

const PRONOUNS_OPTIONS = [
    'Không hiển thị',
    'he/him',
    'she/her',
    'they/them',
    'Khác',
];

export default function EditProfileModal({
    visible,
    onClose,
    onSave,
    currentData,
}: EditProfileModalProps) {
    const [displayName, setDisplayName] = useState(currentData.displayName || '');
    const [bio, setBio] = useState(currentData.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(currentData.avatarUrl || '');
    const [pronouns, setPronouns] = useState(currentData.pronouns || '');
    const [country, setCountry] = useState(currentData.country || '');
    const [birthDate, setBirthDate] = useState<Date | null>(
        currentData.birthDate ? new Date(currentData.birthDate) : null
    );
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPronounsMenu, setShowPronounsMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    // Reset form when modal opens with new data
    useEffect(() => {
        if (visible) {
            setDisplayName(currentData.displayName || '');
            setBio(currentData.bio || '');
            setAvatarUrl(currentData.avatarUrl || '');
            setPronouns(currentData.pronouns || '');
            setCountry(currentData.country || '');
            setBirthDate(currentData.birthDate ? new Date(currentData.birthDate) : null);
            setAvatarError(false);
        }
    }, [visible, currentData]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const data: UpdateProfileRequest = {};
            
            if (displayName !== currentData.displayName) {
                data.displayName = displayName;
            }
            if (bio !== currentData.bio) {
                data.bio = bio;
            }
            if (avatarUrl !== currentData.avatarUrl) {
                data.avatarUrl = avatarUrl;
            }
            if (pronouns !== currentData.pronouns) {
                data.pronouns = pronouns === 'Không hiển thị' ? '' : pronouns;
            }
            if (country !== currentData.country) {
                data.country = country;
            }
            if (birthDate) {
                const dateStr = birthDate.toISOString().split('T')[0];
                if (dateStr !== currentData.birthDate) {
                    data.birthDate = dateStr;
                }
            }

            await onSave(data);
            onClose();
        } catch (error) {
            console.error('Save profile error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setBirthDate(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                        <Text style={styles.cancelText}>Hủy</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
                    <TouchableOpacity 
                        onPress={handleSave} 
                        style={styles.headerButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={DiscordColors.blurple} />
                        ) : (
                            <Text style={styles.saveText}>Lưu</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            {avatarUrl && !avatarError ? (
                                <Image 
                                    source={{ uri: avatarUrl }}
                                    style={styles.avatar}
                                    onError={() => setAvatarError(true)}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                    <Ionicons name="person" size={40} color={DiscordColors.textMuted} />
                                </View>
                            )}
                        </View>
                        <Text style={styles.avatarHint}>Nhập URL ảnh đại diện bên dưới</Text>
                    </View>

                    {/* Avatar URL Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>URL Ảnh đại diện</Text>
                        <TextInput
                            style={styles.input}
                            value={avatarUrl}
                            onChangeText={(text) => {
                                setAvatarUrl(text);
                                setAvatarError(false);
                            }}
                            placeholder="https://example.com/avatar.jpg"
                            placeholderTextColor={DiscordColors.textMuted}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Display Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tên hiển thị</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Tên hiển thị của bạn"
                            placeholderTextColor={DiscordColors.textMuted}
                            maxLength={32}
                        />
                    </View>

                    {/* Bio */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Giới thiệu</Text>
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Giới thiệu về bạn..."
                            placeholderTextColor={DiscordColors.textMuted}
                            multiline
                            numberOfLines={4}
                            maxLength={190}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{bio.length}/190</Text>
                    </View>

                    {/* Pronouns */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Đại từ nhân xưng</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowPronounsMenu(!showPronounsMenu)}
                        >
                            <Text style={pronouns ? styles.selectValue : styles.selectPlaceholder}>
                                {pronouns || 'Chọn đại từ'}
                            </Text>
                            <Ionicons 
                                name={showPronounsMenu ? "chevron-up" : "chevron-down"} 
                                size={20} 
                                color={DiscordColors.textSecondary} 
                            />
                        </TouchableOpacity>
                        {showPronounsMenu && (
                            <View style={styles.dropdown}>
                                {PRONOUNS_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.dropdownItem,
                                            pronouns === option && styles.dropdownItemSelected
                                        ]}
                                        onPress={() => {
                                            setPronouns(option);
                                            setShowPronounsMenu(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            pronouns === option && styles.dropdownItemTextSelected
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Country */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Quốc gia</Text>
                        <TextInput
                            style={styles.input}
                            value={country}
                            onChangeText={setCountry}
                            placeholder="Quốc gia của bạn"
                            placeholderTextColor={DiscordColors.textMuted}
                        />
                    </View>

                    {/* Birth Date */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ngày sinh</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={birthDate ? styles.selectValue : styles.selectPlaceholder}>
                                {birthDate ? formatDate(birthDate) : 'Chọn ngày sinh'}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color={DiscordColors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={birthDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                            minimumDate={new Date(1900, 0, 1)}
                        />
                    )}

                    {/* Bottom padding */}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DiscordColors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: DiscordColors.divider,
    },
    headerButton: {
        minWidth: 60,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSizes.lg,
        fontWeight: '600',
        color: DiscordColors.textPrimary,
    },
    cancelText: {
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
    },
    saveText: {
        fontSize: FontSizes.md,
        color: DiscordColors.blurple,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        backgroundColor: DiscordColors.backgroundDarker,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarHint: {
        fontSize: FontSizes.sm,
        color: DiscordColors.textMuted,
        marginTop: Spacing.sm,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: FontSizes.xs,
        fontWeight: '600',
        color: DiscordColors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
    },
    bioInput: {
        minHeight: 100,
        paddingTop: Spacing.md,
    },
    charCount: {
        fontSize: FontSizes.xs,
        color: DiscordColors.textMuted,
        textAlign: 'right',
        marginTop: Spacing.xs,
    },
    selectButton: {
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectValue: {
        fontSize: FontSizes.md,
        color: DiscordColors.textPrimary,
    },
    selectPlaceholder: {
        fontSize: FontSizes.md,
        color: DiscordColors.textMuted,
    },
    dropdown: {
        backgroundColor: DiscordColors.backgroundDarker,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.xs,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    dropdownItemSelected: {
        backgroundColor: DiscordColors.blurple + '20',
    },
    dropdownItemText: {
        fontSize: FontSizes.md,
        color: DiscordColors.textSecondary,
    },
    dropdownItemTextSelected: {
        color: DiscordColors.blurple,
        fontWeight: '500',
    },
});

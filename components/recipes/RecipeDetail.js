import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert
} from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from '@env';
import { useAuth } from "../context/AuthContext";
import detailStyles from "./RecipesDetailStyles";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/FontAwesome5";
import Icon3 from "react-native-vector-icons/Ionicons";
import StarRating from 'react-native-star-rating-widget';
import { useAccessibility } from "../AccessibleView/AccessibleView";
const RecipeDetail = () => {
    const { highContrast } = useAccessibility();
    const route = useRoute();
    const { recipe: initialRecipe, recipeId } = route.params;
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(initialRecipe || null);
    const [loading, setLoading] = useState(!initialRecipe);
    const [error, setError] = useState(null);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [isRatingLoading, setIsRatingLoading] = useState(false);
    const [hasUserRated, setHasUserRated] = useState(false);
    const [checkingRating, setCheckingRating] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});

    const toggleCommentExpansion = (commentId) => {
        setExpandedComments(prev => ({
          ...prev,
          [commentId]: !prev[commentId]
        }));
      };
      
      const getPreviewText = (text, wordLimit = 10) => {
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
      };
    const checkUserRating = async () => {
    if (!user?.UserId || !recipeId) {
        setHasUserRated(false);
        return;
    }
    
    try {
        setCheckingRating(true);
        const response = await axios.get(`${API_BASE_URL}/api/recipes/rating`, {
            params: {
                recipeId,
                userId: user.UserId
            },
            headers: {
                Authorization: `Bearer ${user?.token}`
            }
        });
        
        if (response.data.rating) {
            setUserRating(response.data.rating.Rating);
            setUserComment(response.data.rating.Comment || '');
            setHasUserRated(true);
        } else {
            setHasUserRated(false);
            setUserRating(0);
            setUserComment('');
        }
    } catch (err) {
        console.error("Error checking user rating:", err);
        setHasUserRated(false);
    } finally {
        setCheckingRating(false);
    }
};
    useEffect(() => {
        
        if (!initialRecipe && recipeId) {
            fetchRecipeDetails(recipeId);
        }
        
        // Zawsze sprawdzaj ocenę użytkownika, niezależnie od tego czy mamy initialRecipe
        if (user?.UserId && recipeId) {
            checkUserRating();
        }
    }, [initialRecipe, recipeId, user?.UserId]); // Dodajemy user?.UserId do zależności
    const fetchRecipeDetails = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/recipes/detail/${id}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });
            
            setRecipe(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching recipe details:", err);
            setError("Failed to load recipe details");
            setLoading(false);
        }
    };

    

    const handleRateRecipe = async () => {
        if (!userRating) {
          Alert.alert("Error", "Please select a rating");
          return;
        }
      
        setIsRatingLoading(true);
        try {
          const response = await axios.post(`${API_BASE_URL}/api/recipes/rate`, {
            recipeId,
            userId: user.UserId,
            rating: userRating,
            comment: userComment
          }, {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });
      
          if (response.data.success) {
            // Aktualizacja stanu przepisu
            setRecipe(prev => ({
              ...prev,
              averageRating: parseFloat(response.data.averageRating),
              ratingCount: response.data.ratingCount
            }));
            
            // Aktualizacja oceny użytkownika
            setUserRating(response.data.userRating || userRating);
            setHasUserRated(true);
            
            setRatingModalVisible(false);
            Alert.alert("Success", "Thank you for your rating!");
          }
        } catch (err) {
          console.error("Error rating recipe:", err);
          Alert.alert("Error", err.response?.data?.message || "Failed to submit rating");
        } finally {
          setIsRatingLoading(false);
        }
      };

    const handleEditRating = () => {
        setRatingModalVisible(true);
    };

    const handleDeleteRating = async () => {
        setIsRatingLoading(true);
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/recipes/rating`, {
                data: {
                    recipeId,
                    userId: user.UserId
                },
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });

            if (response.data.success) {
                setRecipe(prev => ({
                    ...prev,
                    averageRating: response.data.averageRating,
                    ratingCount: response.data.ratingCount
                }));
                setUserRating(0);
                setUserComment('');
                setHasUserRated(false);
                Alert.alert("Success", "Your rating has been removed");
            }
        } catch (err) {
            console.error("Error deleting rating:", err);
            Alert.alert("Error", "Failed to delete rating");
        } finally {
            setIsRatingLoading(false);
        }
    };

    

    if (loading) {
        return (
            <View style={[styles.loadingContainer, highContrast && styles.highContrastBackground]}>
                <ActivityIndicator size="large" color="#5D4037" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, highContrast && styles.highContrastBackground]}>
                <Icon name="error-outline" size={40} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={[styles.errorContainer, highContrast && styles.highContrastBackground]}>
                <Icon name="search-off" size={40} color="#5D4037" />
                <Text style={styles.errorText}>Recipe not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, highContrast && styles.highContrastBackground]}>
            {/* Recipe Header */}
            <View style={[styles.header, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.title, highContrast && styles.highContrastBackground]}>{recipe.name || recipe.Name}</Text>
                <Text style={[styles.author, highContrast && styles.highContrastBackground]}>By {recipe.UserName}</Text>
            </View>

            {/* Hero Image */}
            <Image
                source={{ uri: recipe.Image }}
                style={styles.image}
                resizeMode="cover"
            />

            {/* Rating and Categories */}
            <View style={[styles.metaContainer, highContrast && styles.highContrastBackground]}>
                <View style={[styles.ratingContainer, highContrast && styles.secondContrast]}>
                    <Icon name="star" size={20} color="#FFC107" solid />
                    <Text style={[styles.ratingText, highContrast && styles.secondContrast]}>
                    {recipe.averageRating ? parseFloat(recipe.averageRating).toFixed(1) : "0.0"}
                    </Text>
                    <Text style={[styles.ratingCount, highContrast && styles.secondContrast]}>({recipe.ratingCount || 0})</Text>
                    
                    {user && (
                        <TouchableOpacity 
                            style={[styles.rateButton, highContrast && styles.secondContrast]}
                            onPress={hasUserRated ? handleEditRating : () => setRatingModalVisible(true)}
                        >
                            {hasUserRated ?
                                <Icon2 name="edit" size={20} color={highContrast ? '#FFFFFF' : '#5D4037'}
                                 solid />
                                :
                                <Icon3 name="add-circle" size={20} color={highContrast ? '#FFFFFF' : '#5D4037'} solid />}
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {(recipe.categories || []).map((category, index) => (
                        <View key={index} style={[styles.categoryPill, highContrast && styles.secondContrast]}>
                            <Text style={[styles.categoryText, highContrast && styles.secondContrast]}>{category}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
               {/* User Rating Section */}
               {checkingRating ? (
    <View style={[styles.userRatingContainer, highContrast && styles.highContrastBackground]}>
        <ActivityIndicator size="small" color={highContrast ? '#FFFFFF' : '#5D4037'} />
    </View>
) : hasUserRated ? (
    <View style={[styles.userRatingContainer, highContrast && styles.secondContrast]}>
        <Text style={[styles.userRatingTitle, highContrast && styles.secondContrast]}>Your Rating:</Text>
        <View style={[styles.userRatingContainer, highContrast && styles.secondContrast]}>
            <StarRating
                rating={userRating}
                onChange={() => {}}
                starSize={24}
                color="#FFC107"
                enableHalfStar={true}
                maxStars={5}
                starStyle={{ marginHorizontal: 2 }}
                disabled={true}
            />
            {userComment && (
                <Text style={[styles.userComment, highContrast && styles.secondContrast]}>{userComment}</Text>
            )}
        </View>
        <TouchableOpacity 
            style={[styles.deleteRatingButton, highContrast && styles.secondContrast]}
            onPress={handleDeleteRating}
            
            disabled={isRatingLoading}
        >
            <Text style={[styles.deleteRatingButtonText, highContrast && styles.secondContrast]}>
                {isRatingLoading ? 'Removing...' : 'Remove Rating'}
            </Text>
        </TouchableOpacity>
    </View>
) : null}
            {/* Description */}
            {recipe.description && (
                <View style={[styles.section, highContrast && styles.highContrastBackground]}>
                    <Text style={[styles.description, highContrast && styles.highContrastBackground]}>{recipe.description}</Text>
                </View>
            )}

            {/* Nutrition Summary */}
            {recipe.totalNutrition && (
                <View style={[styles.nutritionCard, highContrast && styles.secondContrast]}>
                    <Text style={[styles.sectionTitle, highContrast && styles.secondContrast]}>Nutrition Facts</Text>
                    <View style={styles.divider} />

                    <View style={[styles.nutritionGrid, highContrast && styles.secondContrast]}>
                        <View style={[styles.nutritionItem, highContrast && styles.secondContrast]}>
                            <Text style={[styles.nutritionValue, highContrast && styles.secondContrast]}>
                                {Math.round(recipe.totalNutrition.calories || 0)}
                            </Text>
                            <Text style={[styles.nutritionLabel, highContrast && styles.secondContrast]}>Calories</Text>
                        </View>

                        <View style={[styles.nutritionItem, highContrast && styles.secondContrast]}>
                            <Text style={[styles.nutritionValue, highContrast && styles.secondContrast]}>
                                {Math.round(recipe.totalNutrition.proteins || 0)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, highContrast && styles.secondContrast]}>Protein</Text>
                        </View>

                        <View style={[styles.nutritionItem, highContrast && styles.secondContrast]}>
                            <Text style={[styles.nutritionValue, highContrast && styles.secondContrast]}>
                                {Math.round(recipe.totalNutrition.fats || 0)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, highContrast && styles.secondContrast]}>Fat</Text>
                        </View>

                        <View style={[styles.nutritionItem, highContrast && styles.secondContrast]}>
                            <Text style={[styles.nutritionValue, highContrast && styles.secondContrast]}>
                                {Math.round(recipe.totalNutrition.carbohydrates || 0)}g
                            </Text>
                            <Text style={[styles.nutritionLabel, highContrast && styles.secondContrast]}>Carbs</Text>
                        </View>
                    </View>
                </View>
            )}
            
            {/* Ingredients */}
            <View style={[styles.section, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.sectionTitle, highContrast && styles.highContrastBackground]}>Ingredients</Text>
                <View style={styles.divider} />

                <View style={[styles.ingredientsList, highContrast && styles.highContrastBackground]}>
                    {(recipe.products || []).map((product, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <View style={[styles.ingredientBullet, highContrast && styles.highContrastBackground]} />
                            <Text style={[styles.ingredientText, highContrast && styles.highContrastBackground]}>
                                {product.name} <Text style={[styles.ingredientAmount, highContrast && styles.highContrastBackground]}>({product.amount}g)</Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Instructions */}
            <View style={[styles.section, highContrast && styles.highContrastBackground]}>
                <Text style={[styles.sectionTitle, highContrast && styles.highContrastBackground]}>Instructions</Text>
                <View style={styles.divider} />

                <View style={[styles.instructionsList, highContrast && styles.highContrastBackground]}>
                    {(recipe.steps || []).map((step, index) => (
                        <View key={index} style={[styles.stepItem, highContrast && styles.highContrastBackground]}>
                            <View style={[styles.stepNumberContainer, highContrast && styles.secondContrast]}>
                                <Text style={styles.stepNumber}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.stepText, highContrast && styles.highContrastBackground]}>{step}</Text>
                        </View>
                    ))}
                </View>
            </View>
                
             {/* Rating Modal */}
<Modal
    animationType="slide"
    transparent={true}
    visible={ratingModalVisible}
    onRequestClose={() => setRatingModalVisible(false)}
>
    <View style={styles.modalContainer}>
        <View style={[styles.modalContent, highContrast && styles.secondContrast]}>
            <Text style={[styles.modalTitle, highContrast && styles.secondContrast]}>Rate This Recipe</Text>
            
            <StarRating
                rating={userRating}
                onChange={setUserRating}
                starSize={32}
                color="#FFD700"
                enableHalfStar={true}
                maxStars={5}
                starStyle={{ marginHorizontal: 4 }}
            />
            
            <View style={styles.commentContainer}>
                <TextInput
                    style={[styles.commentInput, highContrast && styles.secondContrast]}
                    placeholderTextColor={highContrast ? '#FFFFFF' : '#999999'}
                    placeholder="Add your comments (max 30 chars)"
                    value={userComment}
                    onChangeText={(text) => {
                        if (text.length <= 30) {
                            setUserComment(text);
                        } else {
                            Alert.alert('Limit exceeded', 'Comments are limited to 30 characters');
                        }
                    }}
                    multiline
                    numberOfLines={4}
                    maxLength={30}
                />
                <Text style={styles.charCounter}>
                    {userComment.length}/30
                </Text>
            </View>
            
            <View style={styles.modalButtons}>
                <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                        setUserComment('');
                        setRatingModalVisible(false);
                    }}
                >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[
                        styles.modalButton, 
                        styles.submitButton,
                        (!userRating || isRatingLoading) && styles.disabledButton
                    ]}
                    onPress={handleRateRecipe}
                    disabled={isRatingLoading || !userRating}
                >
                    <Text style={styles.modalButtonText}>
                        {isRatingLoading ? 'Submitting...' : 'Submit Rating'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
                        {recipe.comments && recipe.comments.length > 0 && (
  <View style={[styles.commentsSection, highContrast && styles.highContrastBackground]}
  >
    <Text style={[styles.commentsTitle, highContrast && styles.highContrastBackground]}>User Comments ({recipe.comments.length})</Text>
    {recipe.comments.map((comment, index) => (
      <TouchableOpacity 
        key={index} 
        style={[styles.commentItem, highContrast && styles.secondContrast]}
        onPress={() => toggleCommentExpansion(comment.id || index)}
        activeOpacity={0.7}
      >
        <View style={[styles.commentHeader, highContrast && styles.secondContrast]}
>
          <Text style={[styles.commentUser, highContrast && styles.secondContrast]}
>
            {comment.userName}
            {comment.userId === user?.UserId}
          </Text>
          {comment.rating && !isNaN(comment.rating) && (
            <View style={styles.commentRating}>
              <StarRating
                rating={Number(comment.rating)}
                onChange={() => {}}
                starSize={16}
                color="#FFC107"
                enableHalfStar={true}
                maxStars={5}
                starStyle={{ marginHorizontal: 1 }}
                disabled={true}
              />
              <Text style={[styles.commentRatingText, highContrast && styles.secondContrast]}
>
                ({Number(comment.rating).toFixed(1)})
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.commentText, highContrast && styles.secondContrast]}
>
          {expandedComments[comment.id || index] 
            ? comment.comment 
            : getPreviewText(comment.comment)}
        </Text>
        {comment.comment.split(' ').length > 10 && (
          <Text style={styles.readMoreText}>
            {expandedComments[comment.id || index] ? 'Show less' : 'Read more'}
          </Text>
        )}
      </TouchableOpacity>
    ))}
  </View>
)}
            <View style={styles.bottomSpacer} />
        </ScrollView>
        
    );
};

const styles = StyleSheet.create({
    highContrastBackground: {
        backgroundColor: '#2e2c2c', 
        color:'white',
    },
    secondContrast: {
        backgroundColor: "#454343",
        color:'white',
    },
    readMoreText: {
        color: '#5D4037',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '500',
        textAlign: 'right',
    },
    commentsSection: {
        padding: 24,
        paddingTop: 0,
        marginBottom: 20,
    },
    commentsTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 16,
    },
    commentItem: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    commentUser: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 8,
    },
    commentText: {
        fontSize: 14,
        color: '#5D4037',
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    commentActionButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    commentActionText: {
        fontSize: 12,
        color: '#5D4037',
        fontWeight: '500',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    paginationButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginHorizontal: 4,
        borderRadius: 4,
    },
    paginationButtonActive: {
        backgroundColor: '#5D4037',
    },
    paginationButtonText: {
        color: '#5D4037',
    },
    paginationButtonTextActive: {
        color: '#FFF',
    },
    editCommentModal: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        width: '90%',
    },
    editCommentInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        minHeight: 100,
        marginBottom: 16,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF8F6',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#5D4037',
        marginTop: 16,
        textAlign: 'center',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#5D4037',
        marginBottom: 4,
    },
    author: {
        fontSize: 16,
        color: '#8D6E63',
        fontStyle: 'italic',
    },
    image: {
        width: '100%',
        height: 280,
        backgroundColor: '#EFEBE9',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        elevation: 2,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037',
        marginLeft: 6,
    },
    categoriesContainer: {
        flexDirection: 'row',
    },
    categoryPill: {
        backgroundColor: '#5D4037',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '500',
    },
    section: {
        padding: 24,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 16,
    },
    divider: {
        height: 2,
        backgroundColor: '#D7CCC8',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#5D4037',
    },
    nutritionCard: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 20,
        elevation: 3,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    nutritionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    nutritionItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 16,
    },
    nutritionValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#5D4037',
    },
    nutritionLabel: {
        fontSize: 14,
        color: '#8D6E63',
        marginTop: 4,
    },
    ingredientsList: {
        marginTop: 8,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    ingredientBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#5D4037',
        marginTop: 8,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 16,
        color: '#5D4037',
        flex: 1,
        lineHeight: 24,
    },
    ingredientAmount: {
        color: '#8D6E63',
    },
    instructionsList: {
        marginTop: 8,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    stepNumberContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#5D4037',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumber: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    stepText: {
        fontSize: 16,
        color: '#5D4037',
        flex: 1,
        lineHeight: 24,
    },
    bottomSpacer: {
        height: 40,
    },
    ratingCount: {
        fontSize: 14,
        color: '#8D6E63',
        marginLeft: 4,
    },
    rateButton: {
        marginLeft: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    rateButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    userRatingContainer: {
        padding: 16,
        margin: 16,
        backgroundColor: '#FFF8F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    userRatingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 8,
    },
    userRatingContent: {
        marginBottom: 12,
    },
    userComment: {
        fontSize: 14,
        color: '#5D4037',
        marginTop: 8,
        fontStyle: 'italic',
    },
    deleteRatingButton: {
        alignSelf: 'flex-end',
        padding: 6,
    },
    deleteRatingButtonText: {
        color: '#D32F2F',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#5D4037',
        marginBottom: 20,
    },
    commentContainer: {
        width: '100%',
        marginVertical: 16,
        position: 'relative',
    },
    commentInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        paddingBottom: 30,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCounter: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        fontSize: 12,
        color: '#888',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'brown',
    },
    submitButton: {
        backgroundColor: 'brown',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    modalButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default RecipeDetail;
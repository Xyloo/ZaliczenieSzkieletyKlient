import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Badge, Row, Col, Form, Alert } from 'react-bootstrap';
import NavigationBar from './NavigationBar';

const RecipeList = () => {
	const [recipes, setRecipes] = useState([]);
	const [user, setUser] = useState(null);
	const [query, setQuery] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const fetchRecipes = async () => {
		try {
			const response = await axios.get('https://localhost:8443/api/recipes', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			setRecipes(response.data);
		} catch (error) {
			console.log(error);
		}
	};

	const fetchUser = async () => {
		if (!localStorage.getItem('token')) return;
		try {
			const response = await axios.get('https://localhost:8443/api/user/profile', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			setUser(response.data);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchRecipes();
		fetchUser();
	}, []);

	const handleSearch = async (event) => {
		event.preventDefault();
		try {
			const response = await axios.post(
				'https://localhost:8443/api/recipes/search',
				{ query },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			setRecipes(response.data);
		} catch (error) {
			setErrorMessage('Wystąpił błąd podczas wyszukiwania przepisów.');
			console.log(error);
		}
	};

	const handleReset = async () => {
		setQuery('');
		fetchRecipes();
	};

	const addToFavorites = async (recipeId) => {
		try {
			if (isRecipeFavorite(recipeId)) {
				await axios.delete(`https://localhost:8443/api/recipes/${recipeId}/favorite`, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				});
				// Remove the recipe from user's favorites in the state
				setUser((prevUser) => ({
					...prevUser,
					favorites: prevUser.favorites.filter((favorite) => favorite._id !== recipeId),
				}));
			} else {
				await axios.post(`https://localhost:8443/api/recipes/${recipeId}/favorite`, null, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				});
				// Add the recipe to user's favorites in the state
				setUser((prevUser) => ({
					...prevUser,
					favorites: [...prevUser.favorites, { _id: recipeId }],
				}));
			}
		} catch (error) {
			console.log(error);
		}
	};

	const isRecipeFavorite = (recipeId) => {
		if (user && user.favorites) {
			return user.favorites.some((favorite) => favorite._id === recipeId);
		}
		return false;
	};

	return (
		<div>
			<NavigationBar />
			<div className="container mt-4">
				<h2>Przeglądaj przepisy</h2>
				<Form onSubmit={handleSearch} className="mb-3">
					<div>
						<Col>
							<Form.Control
								type="text"
								placeholder="Wyszukaj przepisy"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
							/>
						</Col>
						<Col xs="auto">
							<Button type="submit">Szukaj</Button>
							<Button variant="secondary" style={{marginLeft: "1em"}} onClick={handleReset}>
								Resetuj
							</Button>
						</Col>
					</div>
				</Form>
				{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
				<Row>
					{recipes.map((recipe) => (
						<Col key={recipe._id} sm={6} lg={4} xl={3}>
							<Card className="mb-3">
								{recipe.images[0] ? (
									// Sprawdzanie, czy recipe.images[0] jest zdefiniowane
									<Card.Img
										variant="top"
										src={'https://localhost:8443/images' + recipe.images[0]}
										alt={recipe.name}
										style={{ maxHeight: '350px', objectFit: 'cover' }}
									/>
								) : (
									<Card.Img
										variant="top"
										src={'https://localhost:8443/images/uploads/placeholder.png'}
										alt={recipe.name}
										style={{ maxHeight: '350px', objectFit: 'cover' }}
									/>
								)}
								<Card.Body>
									<Card.Title>{recipe.name}</Card.Title>
									<Card.Subtitle className="mb-2 text-muted">
										Autor: {recipe.createdBy.firstName} {recipe.createdBy.lastName}
									</Card.Subtitle>
									<Card.Text>{recipe.description}</Card.Text>
									<div>
										<Badge variant="secondary" className="mr-2">
											Komentarze: {recipe.comments.length}
										</Badge>
									</div>
									<Card.Text></Card.Text>
									<Button variant="primary" href={`/recipes/${recipe._id}`}>
										Zobacz szczegóły
									</Button>
									<div className="mt-3">
										<Button
											variant={isRecipeFavorite(recipe._id) ? 'danger' : 'success'}
											onClick={() => addToFavorites(recipe._id)}
										>
											{isRecipeFavorite(recipe._id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
										</Button>
									</div>
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>
			</div>
		</div>
	);
};

export default RecipeList;

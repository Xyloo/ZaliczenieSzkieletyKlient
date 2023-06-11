import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import NavigationBar from './NavigationBar';
import {useParams} from "react-router-dom";

const RecipeEdit = () => {
	const [recipe, setRecipe] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		ingredients: '',
		instructions: '',
		visibility: '',
	});
	const [newImages, setNewImages] = useState([]);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const { id } = useParams();

	useEffect(() => {
		fetchRecipe();
	}, []);

	const fetchRecipe = async () => {
		try {
			const response = await axios.get(`https://localhost:8443/api/recipes/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			setRecipe(response.data.recipe);
			setFormData({
				name: response.data.recipe.name,
				ingredients: response.data.recipe.ingredients,
				instructions: response.data.recipe.instructions,
				visibility: response.data.recipe.visibility,
			});
		} catch (error) {
			console.log(error);
		}
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleNewImageChange = (event) => {
		const files = event.target.files;
		setNewImages(Array.from(files));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		try {
			const recipeData = new FormData();
			recipeData.append('name', formData.name);
			recipeData.append('ingredients', formData.ingredients);
			recipeData.append('instructions', formData.instructions);
			recipeData.append('visibility', formData.visibility);
			for (let i = 0; i < newImages.length; i++) {
				recipeData.append('images', newImages[i]);
			}

			await axios.put(`https://localhost:8443/api/recipes/${id}`, recipeData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});

			setSuccessMessage('Przepis został zaktualizowany.');
			setErrorMessage('');
		} catch (error) {
			console.error(error);
			setSuccessMessage('');
			setErrorMessage(
				`Wystąpił błąd podczas aktualizacji przepisu: ${error.response.data.error}. Spróbuj ponownie.`
			);
		}
	};

	const handleDeleteRecipe = async () => {
		try {
			await axios.delete(`https://localhost:8443/api/recipes/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			window.location = '/recipes'
		} catch (error) {
			console.log(error);
		}
	};

	const handleDeleteImage = async (imageId) => {
		try {
			await axios.delete(`https://localhost:8443/api/recipes/${id}/images/${imageId}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			fetchRecipe(); // Ponownie pobierz przepis po usunięciu obrazu
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<NavigationBar />
			<Container className="w-75 mt-3 border p-3 border-dark-subtle">
				<h2>Edytuj przepis</h2>
				<hr />
				{successMessage && <Alert variant="success">{successMessage}</Alert>}
				{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
				{recipe && (
					<Card>
						<Card.Body>
							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3" controlId="name">
									<Form.Label>Nazwa</Form.Label>
									<Form.Control
										name="name"
										type="text"
										value={formData.name}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="ingredients">
									<Form.Label>Składniki</Form.Label>
									<Form.Control
										name="ingredients"
										as="textarea"
										rows={5}
										value={formData.ingredients}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="instructions">
									<Form.Label>Instrukcje</Form.Label>
									<Form.Control
										name="instructions"
										as="textarea"
										rows={10}
										value={formData.instructions}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="newImages">
									<Form.Label>Nowe obrazy (max. 5)</Form.Label>
									<Form.Control
										name="newImages"
										type="file"
										accept="image/*"
										multiple
										onChange={handleNewImageChange}
										maxLength={5}
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="visibility">
									<Form.Label>Widoczność</Form.Label>
									<Form.Control
										name="visibility"
										as="select"
										value={formData.visibility}
										onChange={handleChange}
										required
									>
										<option value="public" name="public">
											Publiczny
										</option>
										<option value="private" name="private">
											Prywatny
										</option>
									</Form.Control>
								</Form.Group>

								<Button variant="primary" type="submit">
									Zapisz zmiany
								</Button>
								<Button variant="danger" style={{marginLeft: "1em"}} onClick={handleDeleteRecipe}>
									Usuń przepis
								</Button>
							</Form>
						</Card.Body>
					</Card>
				)}
				{recipe && recipe.images.length > 0 && (
					<Card className="mt-4">
						<Card.Body>
							<h4>Galeria</h4>
							<hr />
							<div className="d-flex flex-wrap">
								{recipe.images.map((image, index) => (
									<div key={index} className="m-2">
										<img
											src={`https://localhost:8443/images${image}`}
											alt={recipe.name}
											style={{ width: '200px', height: '200px', objectFit: 'cover' }}
										/>
										<Button
											variant="danger"
											size="sm"
											className="mt-2"
											onClick={() => handleDeleteImage(index)}
										>
											Usuń
										</Button>
									</div>
								))}
							</div>
						</Card.Body>
					</Card>
				)}
			</Container>
		</div>
	);
};

export default RecipeEdit;

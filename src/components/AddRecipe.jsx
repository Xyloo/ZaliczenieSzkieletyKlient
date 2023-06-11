import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import NavigationBar from "./NavigationBar";

const AddRecipe = () => {
	const [formData, setFormData] = useState({
		name: '',
		ingredients: '',
		instructions: '',
		images: [],
		visibility: 'public'
	});
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(
		() => {
			if(!localStorage.getItem('token')) {
				window.location = '/login';
			}
		})
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleImageChange = (event) => {
		const files = event.target.files;
		setFormData((prevState) => ({
			...prevState,
			images: Array.from(files),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const recipeData = new FormData();
			recipeData.append('name', formData.name);
			recipeData.append('ingredients', formData.ingredients);
			recipeData.append('instructions', formData.instructions);
			recipeData.append('visibility', formData.visibility);
			for (let i = 0; i < formData.images.length; i++) {
				recipeData.append('images', formData.images[i]);
			}

			await axios.post('https://localhost:8443/api/recipes', recipeData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			setFormData({
				name: '',
				ingredients: '',
				instructions: '',
				images: [],
				visibility: ''
			});
			setSuccessMessage('Przepis został dodany.');
			setErrorMessage('');
		} catch (error) {
			console.error(error);
			setSuccessMessage('');
			setErrorMessage(`Wystąpił błąd podczas dodawania przepisu: ${error.response.data.error} Spróbuj ponownie.`);
		}
	};

	return (
		<div>
			<NavigationBar />
			<Container className="w-75 mt-3 border p-3 border-dark-subtle">
				<h2>Dodaj przepis</h2>
				<hr />
				{successMessage && <Alert variant="success">{successMessage}</Alert>}
				{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
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
							<Form.Group className="mb-3" controlId="images">
								<Form.Label>Obrazy (max. 5)</Form.Label>
								<Form.Control
									name="images"
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageChange}
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
									<option value="public" name="public">Publiczny</option>
									<option value="private" name="private">Prywatny</option>
								</Form.Control>
							</Form.Group>

							<Button variant="primary" type="submit">
								Dodaj przepis
							</Button>
						</Form>
					</Card.Body>
				</Card>
			</Container>
		</div>
	);
};

export default AddRecipe;

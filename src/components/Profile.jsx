import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Collapse } from 'react-bootstrap';
import NavigationBar from "./NavigationBar";

const Profile = () => {
	const [user, setUser] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
	});
	const [updateSuccess, setUpdateSuccess] = useState(false);
	const [deleteSuccess, setDeleteSuccess] = useState(false);
	const [isListOpen, setIsListOpen] = useState(false);

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await axios.get('https://localhost:8443/api/user/profile', {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				});
				setUser(response.data);
				setFormData({
					firstName: response.data.firstName,
					lastName: response.data.lastName,
					email: response.data.email,
				});
			} catch (error) {
				if(error.response.status === 401) {
					localStorage.removeItem('token');
					window.location = '/login';
				}
				console.log(error);
			}
		};

		fetchUser();
	}, []);

	useEffect(() => {
		const fetchUserRecipes = async () => {
			try {
				const response = await axios.get('https://localhost:8443/api/user/recipes', {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				});
				const userWithRecipes = { ...user, recipes: response.data };
				setUser(userWithRecipes);
			} catch (error) {
				console.log(error);
			}
		};

		if (user) {
			fetchUserRecipes();
		}
	}, [user]);

	const handleEdit = () => {
		setEditMode(true);
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await axios.put('https://localhost:8443/api/user/profile', formData, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			setUser(response.data);
			setEditMode(false);
			setUpdateSuccess(true);

			setTimeout(() => {
				setUpdateSuccess(false);
			}, 3000);
		} catch (error) {
			console.log(error);
		}
	};

	const handleDelete = async () => {
		try {
			await axios.delete('https://localhost:8443/api/user/profile', {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			setUser(null);
			setDeleteSuccess(true);
			localStorage.removeItem('token');

			setTimeout(() => {
				window.location = '/';
			}, 3000);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<NavigationBar />
			<Container className="w-75 mt-3 border p-3 border-dark-subtle">
				<h2>Profil użytkownika</h2>
				<hr/>
				{updateSuccess && (
					<Alert variant="success" onClose={() => setUpdateSuccess(false)} dismissible>
						Zmiany zostały zapisane.
					</Alert>
				)}
				{deleteSuccess && (
					<Alert variant="danger" onClose={() => setDeleteSuccess(false)} dismissible>
						Twoje konto zostało usunięte.
					</Alert>
				)}
				{user && !editMode && (
					<div>
						<p>Imię: {user.firstName}</p>
						<p>Nazwisko: {user.lastName}</p>
						<p>Email: {user.email}</p>
						<p>Ilość dodanych przepisów: {user.recipes ? user.recipes.length : 0}</p>
						{user.recipes && user.recipes.length > 0 && (
							<div>
								<Button
									variant="link"
									onClick={() => setIsListOpen(!isListOpen)}
									aria-controls="recipeList"
									aria-expanded={isListOpen}
								>
									{isListOpen ? 'Ukryj przepisy' : 'Pokaż przepisy'}
								</Button>
								<Collapse in={isListOpen}>
									<div id="recipeList">
										<p>Lista dodanych przepisów:</p>
										<ul>
											{user.recipes.map((recipe) => (
												<li key={recipe._id}>
													<a href={`/recipes/${recipe._id}`}>{recipe.name}</a>
												</li>
											))}
										</ul>
									</div>
								</Collapse>
							</div>
						)}
						<p>Ilość ulubionych przepisów: {user.favorites.length}</p>
						<hr/>
						<Button variant="primary" onClick={handleEdit}>
							Edytuj
						</Button>
						<Button variant="danger" onClick={handleDelete} className="mx-3">
							Usuń konto
						</Button>
					</div>
				)}

				{user && editMode && (
					<Card>
						<Card.Body>
							<h3>Edytuj profil</h3>
							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3" controlId="firstName">
									<Form.Label>Imię</Form.Label>
									<Form.Control
										name="firstName"
										type="text"
										value={formData.firstName}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="lastName">
									<Form.Label>Nazwisko</Form.Label>
									<Form.Control
										name="lastName"
										type="text"
										value={formData.lastName}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="email">
									<Form.Label>Email</Form.Label>
									<Form.Control
										name="email"
										type="email"
										value={formData.email}
										onChange={handleChange}
										required
									/>
								</Form.Group>
								<Button variant="primary" type="submit">
									Zapisz zmiany
								</Button>
							</Form>
						</Card.Body>
					</Card>
				)}
			</Container>
		</div>
	);
};

export default Profile;

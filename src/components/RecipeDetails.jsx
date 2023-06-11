import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {Alert, Button, Card, Col, Form, ListGroup, Row} from 'react-bootstrap';
import NavigationBar from './NavigationBar';
import {useParams} from 'react-router-dom';

const RecipeDetails = () => {
	const { id } = useParams();
	const [recipe, setRecipe] = useState(null);
	const [user, setUser] = useState(null);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isFavorite, setIsFavorite] = useState(false);

	const fetchRecipe = async () => {
		try {
			const response = await axios.get(`https://localhost:8443/api/recipes/${id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			if (response.data) {
				setRecipe(response.data.recipe);
				setIsFavorite(response.data.isFavorite);
			}
		} catch (error) {
			setErrorMessage('Wystąpił błąd: ' + error.response.data.error);
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
			setErrorMessage('Wystąpił błąd: ' + error.response.data.error);
			console.log(error);
		}
	};

	const fetchComments = async () => {
		try {
			const response = await axios.get(`https://localhost:8443/api/recipes/${id}/comments`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			if (response.data) {
				setComments(response.data);
			}
		} catch (error) {
			setErrorMessage('Wystąpił błąd: ' + error.response.data.error);
			console.log(error);
		}
	};

	useEffect(() => {
		fetchRecipe();
		fetchUser();
		fetchComments();
	}, [id]);

	const formatInstructions = (instructions) => {
		const regex = /(\r\n|\n){2,}/g;
		const regex2 = /\r?\n/g;
		const formattedInstructions = instructions.replace(regex, '\n\n');
		return formattedInstructions.split(regex2);
	};

	const renderIngredients = () => {
		if (recipe && recipe.ingredients) {
			let ingredientsArray = [];
			if (typeof recipe.ingredients === 'string') {
				ingredientsArray = formatInstructions(recipe.ingredients);
			} else if (Array.isArray(recipe.ingredients)) {
				ingredientsArray = recipe.ingredients;
			}
			return (
				<ListGroup>
					{ingredientsArray.map((ingredient, index) => (
						<ListGroup.Item key={index}>{ingredient}</ListGroup.Item>
					))}
				</ListGroup>
			);
		}
		return null;
	};

	const renderInstructions = () => {
		if (recipe && recipe.instructions) {
			const instructionsArray = formatInstructions(recipe.instructions);
			return (
				<Card.Text>
					{instructionsArray.map((instruction, index) => (
						<React.Fragment key={index}>
							{instruction}
							<br />
						</React.Fragment>
					))}
				</Card.Text>
			);
		}
		return null;
	};

	const renderGallery = () => {
		if (recipe && recipe.images) {
			return (
				<div>
					{recipe.images.map((image, index) => (
						<img
							key={index}
							src={`https://localhost:8443/images/${image}`}
							alt={`Image ${index + 1}`}
							style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'cover' }}
						/>
					))}
				</div>
			);
		}
		return null;
	};

	const renderComments = () => {
		return (
			<Card.Body>
				<Card.Title>Komentarze</Card.Title>
				{Array.isArray(comments) &&
					comments.map((comment) => (
						<Card.Text key={comment._id}>
							<strong>
								{comment.createdBy.firstName} {comment.createdBy.lastName}
							</strong>
							: {comment.content}
							{isCommentAuthor(comment) && (
								<>
									<Button
										variant="primary"
										size="sm"
										style={{ marginLeft: '1.5rem' }}
										onClick={() => handleEditComment(comment)}
									>
										Edytuj
									</Button>
									<Button
										variant="danger"
										size="sm"
										style={{ marginLeft: '0.5rem' }}
										onClick={() => handleDeleteComment(comment)}
									>
										Usuń
									</Button>
								</>
							)}
						</Card.Text>
					))}
			</Card.Body>
		);
	};

	const isRecipeAuthor = () => {
		if (user && recipe && recipe.createdBy) {
			return user._id === recipe.createdBy._id;
		}
		return false;
	};

	const isCommentAuthor = (comment) => {
		return user && comment.createdBy && user._id === comment.createdBy._id;
	};

	const handleSubmitComment = async (event) => {
		event.preventDefault();
		try {
			await axios.post(
				`https://localhost:8443/api/recipes/${id}/comments`,
				{ content: newComment },
				{
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				}
			);
			setNewComment('');
			// Fetch updated comments
			fetchComments();
		} catch (error) {
			setErrorMessage('Wystąpił błąd: ' + error.response.data.error);
			console.log(error);
		}
	};

	const handleDeleteComment = async (comment) => {
		try {
			await axios.delete(`https://localhost:8443/api/comments/${comment._id}`, {
				headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
			});
			// Aktualizuj stan komentarzy po usunięciu
			setComments((prevComments) => prevComments.filter((c) => c._id !== comment._id));
		} catch (error) {
			console.log(error);
			setErrorMessage(
				`Wystąpił błąd podczas usuwania komentarza: ${error.response.data.error} Spróbuj ponownie.`
			);
		}
	};

	const handleEditComment = async (comment) => {
		const editedComment = prompt('Edytuj komentarz:', comment.content);
		if (editedComment !== null && editedComment !== comment.content) {
			try {
				const response = await axios.put(
					`https://localhost:8443/api/comments/${comment._id}`,
					{ content: editedComment },
					{
						headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
					}
				);
				const updatedComment = response.data;
				setComments((prevComments) =>
					prevComments.map((c) => (c._id === updatedComment._id ? updatedComment : c))
				);
				fetchComments();
			} catch (error) {
				console.log(error);
				setErrorMessage('Wystąpił błąd podczas edytowania komentarza. Spróbuj ponownie.');
			}
		}
	};

	const handleToggleFavorite = async () => {
		try {
			if (isFavorite) {
				await axios.delete(`https://localhost:8443/api/recipes/${id}/favorite`, {
					headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
				});
				setIsFavorite(false);
			} else {
				await axios.post(
					`https://localhost:8443/api/recipes/${id}/favorite`,
					{},
					{
						headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
					}
				);
				setIsFavorite(true);
			}
		} catch (error) {
			console.log(error);
			setErrorMessage(
				`Wystąpił błąd podczas aktualizacji listy ulubionych: ${error.response.data.error}. Spróbuj ponownie.`
			);
		}
	};

	return (
		<div>
			<NavigationBar />
			<div className="container mt-4">
				{errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
				{recipe && (
					<Card>
						<Row>
							<Col md={8} style={{ paddingRight: 0 }}>
								<Card.Header as="h5" style={{ backgroundColor: 'white' }}>
									{recipe.name}
								</Card.Header>
								<Card.Body>
									<Card.Title>Składniki</Card.Title>
									{renderIngredients()}
									<Card.Title>Instrukcje</Card.Title>
									{renderInstructions()}
									{isRecipeAuthor() && (
										<Button variant="primary" href={`/recipes/${recipe._id}/edit`}>
											Edytuj
										</Button>
									)}
									{user && (
										<Button variant={isFavorite ? 'danger' : 'success'} style={{marginLeft: "1em"}} onClick={handleToggleFavorite}>
											{isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
										</Button>
									)}
									{renderComments()} {/* Dodaj wywołanie funkcji renderComments */}
									{user && (
										<Form onSubmit={handleSubmitComment}>
											<Form.Group controlId="comment">
												<Form.Label>Dodaj komentarz</Form.Label>
												<Form.Control
													as="textarea"
													rows={3}
													value={newComment}
													onChange={(e) => setNewComment(e.target.value)}
													required
												/>
											</Form.Group>
											<Button variant="primary" type="submit">
												Dodaj
											</Button>
										</Form>
									)}
								</Card.Body>
							</Col>
							<Col md={4} style={{ borderLeft: 'var(--bs-card-border-width) solid var(--bs-card-border-color)' }}>
								<Card.Body>
									<Card.Title>Galeria</Card.Title>
									{renderGallery()}
								</Card.Body>
							</Col>
						</Row>
					</Card>
				)}
			</div>
		</div>
	);
};

export default RecipeDetails;

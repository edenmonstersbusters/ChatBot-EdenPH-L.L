const SUPABASE_URL = 'https://upgngfmyatpzfxvmnmpc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZ25nZm15YXRwemZ4dm1ubXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDA0NTAsImV4cCI6MjA4ODk3NjQ1MH0.tLW-b0IOCxmOGMpTJKoWWL5aYqg7821pm-6drWcigcQ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Cache the main chat container for event delegation
const affichageReponseContainer = document.getElementById('affichageReponse');
const inputQuestionElement = document.getElementById('inputQuestion');

// Initial event listener for the main question input (this one is static)
inputQuestionElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generate_answer();
    }
});

// --- Event Delegation for dynamically added elements ---
document.addEventListener('DOMContentLoaded', () => {
    affichageReponseContainer.addEventListener('click', async (e) => {
        // Handle click on "Envoyer" button for adding new answers
        if (e.target.classList.contains('add-answer-btn')) {
            const inputId = e.target.dataset.inputId; // Get the unique ID of the associated input
            const question = decodeURIComponent(e.target.dataset.question); // Get the original question
            const inputElement = document.getElementById(inputId);

            if (inputElement && inputElement.value.trim() !== '') {
                await addanswer(question, inputElement.value.trim());
                inputElement.value = ''; // Clear the input after sending
            }
        }
        // You can add logic here for like/dislike buttons if needed
        // if (e.target.classList.contains('like-btn')) { ... }
        // if (e.target.classList.contains('dislike-btn')) { ... }
    });

    affichageReponseContainer.addEventListener('keypress', async (e) => {
        // Handle 'Enter' key press on dynamically added feedback inputs
        if (e.key === 'Enter' && e.target.classList.contains('feedback-input')) {
            const question = decodeURIComponent(e.target.dataset.question); // Get the original question
            const newreponse = e.target.value.trim();

            if (newreponse !== '') {
                await addanswer(question, newreponse);
                e.target.value = ''; // Clear the input after sending
            }
        }
    });
});

async function addanswer(question, newreponse) {
    console.log(`Ajout de réponse pour la question : "${question}" avec la réponse : "${newreponse}"`);
    const { data, error } = await supabaseClient
        .from('informations')
        .insert([{ question, reponse: newreponse }]); // Make sure the column name matches your Supabase table ('reponse' as per your select)

    if (error) {
        console.error("Erreur lors de l'ajout de la réponse :", error);
        // Vous pouvez ajouter une notification à l'utilisateur ici
    } else {
        console.log("Nouvelle réponse ajoutée avec succès !", data);
        // Vous pouvez ajouter une notification de succès à l'utilisateur ici
    }
}

async function generate_answer() {
    let question = inputQuestionElement.value; // Use the cached element

    const rechercheNettoyee = question.toLowerCase().trim();

    affichageQuestion(question);
    inputQuestionElement.value = ''; // Clear the main input after sending

    const { data, error } = await supabaseClient
        .from('informations')
        .select('reponse')
        .textSearch('question', rechercheNettoyee, {
            config: 'french',
            type: 'websearch'
        })
        .limit(2);

    if (error) {
        displayChat("Erreur de recherche.", question);
        console.error("Supabase search error:", error);
    } else if (data.length > 0) {
        displayChat(data[0].reponse, question);
    } else {
        displayChat("Désolé, je n'ai pas trouvé de réponse à cette question.", question);
    }
}

function displayChat(reponse, question) {
    console.log("Réponse du ChatBot :", reponse);

    // Générer un ID unique pour le champ de saisie de feedback
    const uniqueInputId = `inputAddAnswer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const encodedQuestion = encodeURIComponent(question); // Encoder la question pour la passer en attribut de données

    affichageReponseContainer.innerHTML += `
        <div class="reponse-container bot-message">
            <h2 class="affichageTexte">ChatBot :</h2>
            <p class="affichageTexte">${reponse}</p>
        </div>
        <div class="reponse-container feedback-area">
            <button class="send-btn like-btn" data-question="${encodedQuestion}">👍</button>
            <button class="send-btn dislike-btn" data-question="${encodedQuestion}">👎</button>
            <input type="text" class="chat-input feedback-input"
                   data-question="${encodedQuestion}"
                   placeholder="Indiquez la réponse qui aurait dû être donnée !"
                   id="${uniqueInputId}">
            <button type="submit" class="send-btn add-answer-btn"
                    data-input-id="${uniqueInputId}"
                    data-question="${encodedQuestion}">
                Envoyer
            </button>
        </div>
    `;
    // Faites défiler vers le bas pour voir les nouveaux messages
    affichageReponseContainer.scrollTop = affichageReponseContainer.scrollHeight;
}

function affichageQuestion(question) {
    console.log("Ma question :", question);
    affichageReponseContainer.innerHTML += `
        <div class="reponse-container user-message">
            <h2 class="affichageTexte">Moi :</h2>
            <p class="affichageTexte">${question}</p>
        </div>
    `;
    // Faites défiler vers le bas pour voir les nouveaux messages
    affichageReponseContainer.scrollTop = affichageReponseContainer.scrollHeight;
}
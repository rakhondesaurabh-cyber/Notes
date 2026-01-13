document.addEventListener('DOMContentLoaded', () => {
    const notesGrid = document.querySelector('.notes-grid');
    const createNoteBtn = document.getElementById('createNoteBtn');
    const searchInput = document.getElementById('searchInput');

    let notes = JSON.parse(localStorage.getItem('notes-data')) || [];

    // Migrate old data if it exists (basic check)
    if (!localStorage.getItem('notes-data') && localStorage.getItem('notes')) {
        // This is a naive migration attempt if the user had legacy HTML stored
        // Avoiding direct HTML injection for security, starting fresh is safer often
        // But for continuity, let's just initialize empty or try to parse if possible.
        // We will stick to the plan of a fresh start for the structure as the old format was raw HTML.
    }

    function saveNotes() {
        localStorage.setItem('notes-data', JSON.stringify(notes));
    }

    function createNoteElement(id, content, date, color = 'color-white') {
        const div = document.createElement('div');
        div.classList.add('note-card', color);
        div.dataset.id = id;

        // Date formatting
        const dateObj = new Date(date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        div.innerHTML = `
            <div class="note-header">
                <span>${dateStr}</span>
            </div>
            <textarea class="note-content" placeholder="Type your note here...">${content}</textarea>
            <div class="note-footer">
                <div class="color-picker">
                    <button class="color-btn" style="background: #fff;"></button>
                    <button class="color-btn" style="background: #ffb3b3;"></button>
                    <button class="color-btn" style="background: #b8ffb8;"></button>
                    <button class="color-btn" style="background: #b3d9ff;"></button>
                    <button class="color-btn" style="background: #ffffb3;"></button>
                </div>
                <button class="delete-btn" aria-label="Delete Note">
                    <img src="images/delete.png" alt="Delete">
                </button>
            </div>
        `;

        const textarea = div.querySelector('textarea');
        textarea.addEventListener('input', (e) => {
            updateNote(id, e.target.value);
        });

        // Add event listeners for color buttons manually to avoid global scope issues or inline onclick limitations
        const colorBtns = div.querySelectorAll('.color-btn');
        const colors = ['color-white', 'color-red', 'color-green', 'color-blue', 'color-yellow'];
        colorBtns.forEach((btn, index) => {
            btn.onclick = () => updateNoteColor(id, colors[index], div);
        });

        const deleteBtn = div.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteNote(id, div);
        });

        return div;
    }

    function renderNotes(notesToRender) {
        notesGrid.innerHTML = '';
        notesToRender.forEach(note => {
            const noteEl = createNoteElement(note.id, note.content, note.date, note.color);
            notesGrid.appendChild(noteEl);
        });
    }

    function addNote() {
        const newNote = {
            id: Date.now().toString(),
            content: "",
            date: new Date().toISOString(),
            color: 'color-white'
        };
        notes.unshift(newNote); // Add to beginning
        saveNotes();

        const noteEl = createNoteElement(newNote.id, newNote.content, newNote.date, newNote.color);
        notesGrid.prepend(noteEl);
    }

    function updateNoteColor(id, newColor, element) {
        const note = notes.find(n => n.id === id);
        if (note) {
            note.color = newColor;
            saveNotes();

            // Remove old color classes
            element.classList.remove('color-white', 'color-red', 'color-green', 'color-blue', 'color-yellow');
            // Add new color class
            element.classList.add(newColor);
        }
    }

    function updateNote(id, newContent) {
        const note = notes.find(n => n.id === id);
        if (note) {
            note.content = newContent;
            saveNotes();
        }
    }

    function deleteNote(id, element) {
        const confirmDelete = confirm("Are you sure you want to delete this note?");
        if (confirmDelete) {
            notes = notes.filter(n => n.id !== id);
            saveNotes();

            // Animation for removal
            element.style.transform = 'scale(0.9)';
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
    }

    function filterNotes(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = notes.filter(note =>
            note.content.toLowerCase().includes(lowerQuery)
        );
        renderNotes(filtered);
    }

    // Event Listeners
    createNoteBtn.addEventListener('click', addNote);

    searchInput.addEventListener('input', (e) => {
        filterNotes(e.target.value);
    });

    // Initial Render
    renderNotes(notes);
});

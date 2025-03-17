const bookList = [];
const RENDER_EVENT = "render_book";
const STORAGE_KEY = 'BOOKSHELF-APPS';

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageExist()) {
        const bookJSON = JSON.stringify(bookList);
        localStorage.setItem(STORAGE_KEY, bookJSON);
    }
}

function loadDataFromStorage() {
    const serializedBook = localStorage.getItem(STORAGE_KEY);
    let books = JSON.parse(serializedBook);

    if (books !== null) {
        for (const book of books) {
            bookList.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateBookId() {
    return Number(new Date());
}

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = document.getElementById('bookFormYear').value;
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;

    const bookId = generateBookId();
    const bookObject =  {
        id: bookId, 
        title: bookTitle, 
        author: bookAuthor,
        year: Number(bookYear),
        isComplete: bookIsComplete
    }

    bookList.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookById(bookId) {
    for (const bookItem of bookList) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for (const index in bookList) {
        if (bookList[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function finishReadBook(bookId) {
    const bookTarget = findBookById(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function repeatReadBook(bookId) {
    const bookTarget = findBookById(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function createConfirmationDialog(bookIndex) {
    const mainElement = document.getElementsByTagName('main')[0];

    const container = document.createElement('dialog');
    const textTitle = document.createElement('p');
    const buttonContainer = document.createElement('div')
    const yesButton = document.createElement('button');
    const noButton = document.createElement('button');

    const bookTitle = bookList[bookIndex].title;

    textTitle.innerText = `Apakah Anda ingin menghapus buku "${bookTitle}"?`
    yesButton.innerHTML = "Ya!";

    noButton.innerHTML = "Tidak";

    yesButton.addEventListener('click', function () {
        bookList.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT)); 
        saveData()
        container.close();
    });

    noButton.addEventListener('click', function () {
        container.close();
    })

    buttonContainer.setAttribute('class', 'button-list');
    buttonContainer.append(yesButton, noButton);

    container.setAttribute('id', 'confirmationDialog');
    container.append(textTitle, buttonContainer);

    mainElement.appendChild(container);
}

function removeBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex === -1) return;

    console.log('buku sedang dihapus');
    createConfirmationDialog(bookIndex);
    const confirmationDialog = document.getElementById('confirmationDialog');
    confirmationDialog.showModal();
}

function editTheBookList(bookIndex) {
    const bookTarget = bookList[bookIndex];

    const editBookTitle = document.getElementById('editBookTitle').value;
    const editBookAuthor = document.getElementById('editBookAuthor').value;
    const editBookYear = document.getElementById('editBookYear').value;

    bookTarget.title = editBookTitle;
    bookTarget.author = editBookAuthor;
    bookTarget.year = Number(editBookYear);

    document.dispatchEvent(new Event(RENDER_EVENT));
    console.log('Succeed in editing');
    saveData()
}

function editBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    const bookTarget = bookList[bookIndex];

    const editInputTitle = document.getElementById('editBookTitle');
    const editInputAuthor = document.getElementById('editBookAuthor');
    const editInputYear = document.getElementById('editBookYear');
    const editFormSubmit = document.getElementById('editFormSubmit');

    if (bookTarget == null) return;

    editInputTitle.value = bookTarget.title;
    editInputAuthor.value = bookTarget.author;
    editInputYear.value = bookTarget.year;

    editFormSubmit.addEventListener('click', function (event) {
        event.preventDefault();
        editTheBookList(bookIndex);
        blurBackground.style.display ='none';
    })
}

function makeBook(bookItem) {
    const bookTitleElement = document.createElement('h3');
    bookTitleElement.setAttribute("data-testid", "bookItemTitle");
    bookTitleElement.innerText = `${bookItem.title}`;

    const bookAuthorElement = document.createElement('p');
    bookAuthorElement.setAttribute("data-testid", "bookItemAuthor");
    bookAuthorElement.innerText = `Penulis: ${bookItem.author}`;

    const bookYearElement = document.createElement('p');
    bookYearElement.setAttribute("data-testid", "bookItemYear");
    bookYearElement.innerText = `Tahun: ${bookItem.year}`;

    const buttonIsComplete = document.createElement('button');
    buttonIsComplete.setAttribute("data-testid", "bookItemIsCompleteButton"); 

    const buttonDelete = document.createElement('button');
    buttonDelete.setAttribute("data-testid", "bookItemDeleteButton");
    buttonDelete.innerHTML = 'Hapus';
    buttonDelete.addEventListener('click', function () {
        removeBook(bookItem.id);
    });

    const buttonEdit= document.createElement('button');
    buttonEdit.setAttribute("data-testid", "bookItemEditButton");
    buttonEdit.innerHTML = 'Edit';
    buttonEdit.addEventListener('click', function () {
        const addForm = document.getElementById('addBookForm');
        const editForm = document.getElementById('editBookForm');

        blurBackground.style.display = 'block';
        addForm.style.display = 'none';
        editForm.style.display = 'flex';

        editBook(bookItem.id);
    })

    if (!bookItem.isComplete) {
        buttonIsComplete.innerHTML = 'Selesai';
        buttonIsComplete.addEventListener('click', function () {
            finishReadBook(bookItem.id);
        });
    } else {
        buttonIsComplete.innerHTML = 'Ulangi';
        buttonIsComplete.addEventListener('click', function () {
            repeatReadBook(bookItem.id);
        })
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.setAttribute('class', 'button-list');
    buttonContainer.append(buttonIsComplete, buttonDelete, buttonEdit);

    const bookContainer = document.createElement('div');
    bookContainer.setAttribute('data-bookid', `${bookItem.id}`);
    bookContainer.setAttribute('data-testid', 'bookItem');
    bookContainer.append(bookTitleElement, bookAuthorElement, bookYearElement, buttonContainer);

    return bookContainer;
}

function searchBook() {
    const titleTarget = document.getElementById('searchBookTitle').value.toLowerCase();
    console.log(titleTarget)
    console.log(document.getElementById('searchBookTitle').value);
    
    for (const bookItem of bookList) {
        let bookTitle = bookItem.title.toLowerCase();

        if (titleTarget == "") {
            console.log(document.querySelectorAll('[data-testid="bookItem"]'));
            document.querySelector(`[data-bookid="${bookItem.id}"]`).style.display = 'block';
        }

        if (!bookTitle.includes(titleTarget)) {
            console.log('Hide the Book');
            document.querySelector(`[data-bookid="${bookItem.id}"]`).style.display = 'none';
        } else {
            document.querySelector(`[data-bookid="${bookItem.id}"]`).style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const addSubmitForm = document.getElementById('bookFormSubmit');
    const searchSubmit = document.getElementById('searchSubmit');

    const editForm = document.getElementById('editBookForm');
    const addForm = document.getElementById('addBookForm');

    const blurBackground = document.getElementById('blurBackground');

    const navItemPlus = document.getElementById('navItemPlus');
    const crossButtons = document.querySelectorAll('.cross-button');

    const isCompleteBtn = document.getElementById('bookFormIsComplete');
    const bookCategory = document.getElementById('bookCategory');

    addSubmitForm.addEventListener('click', function (event) {
        event.preventDefault();
        addBook();
        blurBackground.style.display ='none';
    });

    document.addEventListener(RENDER_EVENT, function () {
        const incompleteBookList = document.getElementById('incompleteBookList');
        incompleteBookList.innerHTML = '';

        const completeBookList = document.getElementById('completeBookList');
        completeBookList.innerHTML = '';

        for (const bookItem of bookList) {
            const bookElement = makeBook(bookItem);

            if (!bookItem.isComplete) {
                incompleteBookList.append(bookElement);
            } else {
                completeBookList.append(bookElement);
            }
        } 
    });

    navItemPlus.addEventListener('click', function () {
        blurBackground.style.display = 'block';
        editForm.style.display = 'none';
        addForm.style.display = 'flex';
    });

    crossButtons.forEach(button => {
        button.addEventListener('click', function () {
            blurBackground.style.display = 'none'; 
        })
    });

    isCompleteBtn.addEventListener('click', function () {
        if (isCompleteBtn.checked) {
            bookCategory.innerText = 'Selesai dibaca';
        } else {
            bookCategory.innerText = 'Belum selesai dibaca';
        }
    });

    searchSubmit.addEventListener('click', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});
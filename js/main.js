let currentUID = null;

/**
 * -----------
 * ライブラリ・その他
 * -----------
 */

// moment.js
const formatDate = (date) => {
  const m = moment(date);
  return `${m.format('YYYY/MM/DD')}`;
};

// Sortable.js
Sortable.create($('.list')[0], {
  animation: 200,
  handle: ".handle",
  store: {
    get: function(sortable) {
      var order = localStorage.getItem(sortable.options.group.name);
      return order ? order.split('|') : [];
    },
    set: function(sortable) {
      var order = sortable.toArray();
      localStorage.setItem(sortable.options.group.name, order.join('|'));
    }
  }
});

Sortable.create($('.list')[1], {
  animation: 200,
  handle: ".handle",
  store: {
    get: function(sortable) {
      var order = localStorage.getItem(sortable.options.group.name);
      return order ? order.split('|') : [];
    },
    set: function(sortable) {
      var order = sortable.toArray();
      localStorage.setItem(sortable.options.group.name, order.join('|'));
    }
  }
});

Sortable.create($('.list')[2], {
  animation: 200,
  handle: ".handle",
  store: {
    get: function(sortable) {
      var order = localStorage.getItem(sortable.options.group.name);
      return order ? order.split('|') : [];
    },
    set: function(sortable) {
      var order = sortable.toArray();
      localStorage.setItem(sortable.options.group.name, order.join('|'));
    }
  }
});


/**
 * -------------------
 * todo登録・表示画面
 * -------------------
 */

// 送信ボタンを押すとフォームの内容をfirebaseに登録
$('#comment-form').on('submit', (e) => {
  const formText = $('#comment-form_text');
  const formTextVal = formText.val();
  e.preventDefault();
  if (formTextVal === '') {
    return;
  }
  formText.val('');

  const todo = {
    todo: formTextVal,
    option: 0,
    time: firebase.database.ServerValue.TIMESTAMP,
    uid: currentUID,
  };
  firebase
    .database()
    .ref(`todos`)
    .push(todo);
});


// todoを表示するタブを切り替えるための内部処理
const toggle = (todoId, todo) => {

  if (todo.option === 0) {
    firebase
      .database()
      .ref(`todos/${todoId}/option`)
      .set(1);

  }
  else if (todo.option === 1) {
    firebase
      .database()
      .ref(`todos/${todoId}/option`)
      .set(0);
  }
};


// firebaseから該当ID削除
const deleteTodo = (todoId) => {
  firebase
    .database()
    .ref(`todos/${todoId}`)
    .remove();
  $(`.${todoId}`).remove();
};


// 「すべて」タブに表示するためのクローンのクローンを作成する
const duplicate = (todoId, todo) => {

  const dup = $('.todo-template').clone(true);
  const format = formatDate(new Date(todo.time));

  //本文を表示する
  dup
    .removeClass('todo-template')
    .addClass(`${todoId}`)
    .find('.todo-text')
    .text(todo.todo);

  //投稿日を表示する
  dup
    .find('.post-date')
    .html(`作成日：${format}`);

  // 完了・未完了ボタンがクリックされたとき
  dup.find('.complete-button').on('click', function() {
    const classExtract = $(this).parent().attr("class");
    const todoId = classExtract.slice(10);

    toggle(todoId, todo);

  });

  // 削除ボタンがクリックされたとき
  dup.find('.remove-button').on('click', function() {
    const classExtract = $(this).parent().attr("class");
    const todoId = classExtract.slice(10);

    deleteTodo(todoId);
    
  });

  if (todo.uid !== currentUID){
    dup.hide();
  } else {
    if (todo.option === 0) {
      dup
        .find('.complete-button')
        .val('完了する')
        .addClass('btn-success');
    } else if (todo.option === 1) {
      dup
        .find('.complete-button')
        .val('未完了にする')
        .addClass('btn-warning');
    };
    dup.appendTo('#tabs-all');
    return;
  }
};


// 表示用のdivをテンプレートから作成する
const createTodoTemp = (todoId, todo) => {

  const temp = $('.todo-template').clone(true);
  const format = formatDate(new Date(todo.time));

  duplicate(todoId, todo);

  //本文を表示する
  temp
    .removeClass('todo-template')
    .addClass(`${todoId}`)
    .find('.todo-text')
    .text(todo.todo);

  //投稿日を表示する
  temp
    .find('.post-date')
    .html(`作成日：${format}`);

  // 完了・未完了ボタンがクリックされたとき
  temp.find('.complete-button').on('click', function() {
    const classExtract = $(this).parent().attr("class");
    const todoId = classExtract.slice(10);

    toggle(todoId, todo);

  });

  // 削除ボタンがクリックされたとき
  temp.find('.remove-button').on('click', function() {
    const classExtract = $(this).parent().attr("class");
    const todoId = classExtract.slice(10);

    deleteTodo(todoId);
  });

  return temp;
};

// 作成したtodoを表示するための関数
const addTodo = (todoId, todo) => {
  
  const temp = createTodoTemp(todoId, todo);

  if (todo.uid === currentUID){
    if (todo.option === 0) {
      temp
        .appendTo('#tabs-incomplete')
        .find('.complete-button')
        .val('完了する')
        .addClass('btn-success');
    }
    else if (todo.option === 1) {
      temp
        .appendTo('#tabs-completed')
        .find('.complete-button')
        .val('未完了にする')
        .addClass('btn-warning');
    };
    return;
  } else {
    temp.hide();
  }

};


//ページを読み込んだときにデータベースの内容を表示する
const showTodoView = () => {

  const todosRef = firebase.database().ref('todos');

  todosRef.on('child_added',(childSnapshot) => {
    
    const todoId = childSnapshot.key;
    const todo = childSnapshot.val();
    
    addTodo(todoId, todo);
    
  });

  todosRef.on('child_changed',(changedSnapshot) => {
    
    const todoId = changedSnapshot.key;
    const todo = changedSnapshot.val();
    
    $(`.${todoId}`).remove();
    addTodo(todoId, todo);
    
  });

};

/**
 * ---------
 * タブ関連
 * ---------
 */

const showTab = (selector) => {

  $('.tabs-menu li').removeClass('active');
  $(`.tabs-menu a[href="${selector}"]`)
    .parent('li')
    .addClass('active');

  $('.tabs-content > ul').hide();
  $(selector).show();
};

$('.tabs-menu a').on('click', (e) => {
  e.preventDefault();

  const selector = $(e.target).attr('href');
  showTab(selector);
});

// ビュー（画面）を変更する
const showView = (id) => {
  $('.view').hide();
  $(`#${id}`).fadeIn();

  if (id === 'main') {
    showTodoView();
    showTab('#tabs-all');
  }
};

/**
 * -------------
 * ログイン・ログアウト
 * -------------
 */


// ユーザのログイン状態が変化したら呼び出される処理
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUID = user.uid;
    showView('main');
  }
  else {
    currentUID = null;
    showView('login');
  }
});


// 新規登録ボタンがクリックされたとき
$('#sign-up').on('click', () => {

  $('#sign-up').text('送信中…');
  $('#alert').hide();

  const email = $('#user-mail').val();
  const password = $('#user-pass').val();


  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {

      $('#alert').hide();
      $('#sign-up')
        .prop('disabled', false)
        .text('新規登録');
      $('#user-mail').val('');
      $('#user-pass').val('');
    })

    .catch((error) => {
      if (error.code === 'auth/email-already-in-use') {
        $('#alert').text('すでに存在するユーザーです').fadeIn();
      } else if (error.code === 'auth/weak-password') {
        $('#alert').text('6文字以上のパスワードを入力してください').fadeIn();
      } else if (error.code === 'auth/invalid-email') {
        $('#alert').text('メールアドレスを正しく入力してください').fadeIn();
      } else {
        $('#alert').text('ユーザー登録に失敗しました').fadeIn();
      }
      $('#sign-up').text('新規登録');
    });
    
});

// ログインボタンがクリックされたとき
$('#login-form').on('submit', (e) => {
  e.preventDefault();

  $('#login-button').text('送信中…');
  $('#alert').hide();

  const email = $('#user-mail').val();
  const password = $('#user-pass').val();

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {

      $('#alert').hide();
      $('#login-button')
        .prop('disabled', false)
        .text('ログイン');
      $('#user-mail').val('');
      $('#user-pass').val('');
    })

    .catch((error) => {
      if(error.code === 'auth/user-not-found') {
        $('#alert').text('存在しないユーザーです').fadeIn();
      } else if (error.code === 'auth/wrong-password') {
        $('#alert').text('パスワードが違います').fadeIn();
      }
      

      $('#login-button').text('ログイン');
    });
});


const clearTodoView = () => {
  $('#tabs-all').empty();
  $('#tabs-incomplete').empty();
  $('#tabs-completed').empty();
};


// ログアウトボタンがクリックされたとき
$('#logout-button').on('click', () => {

  firebase
    .auth()
    .signOut()
    .then(() => {
      clearTodoView();
    })
    .catch((error) => {
      console.error('ログアウトエラー', error);
    });

});
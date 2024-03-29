const toCurrency = (price) => {
  return new Intl.NumberFormat('ua-UA', {
    currency: 'UAH',
    style: 'currency',
  }).format(price);
};

const toDate = (date) => {
  return new Intl.DateTimeFormat('ua-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
};
document.querySelectorAll('.date').forEach((node) => {
  node.textContent = toDate(node.textContent);
});
document.querySelectorAll('.price').forEach((node) => {
  node.textContent = toCurrency(node.textContent);
});

// Щоб дізнатися, чи є клас, event.target.classList.contains('js-remove')
// Дізнатия id, event.target.dataset.id

const $card = document.querySelector('#card');
if ($card) {
  $card.addEventListener('click', (event) => {
    if (event.target.classList.contains('js-remove')) {
      const id = event.target.dataset.id;
      const csrf = event.target.dataset.csrf;
      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf,
        },
        // body: JSON.stringify({
        //   _csrf: csrf,
        // }),
      })
        .then((res) => res.json())
        .then((card) => {
          if (card.courses.length) {
            const html = card.courses
              .map((c) => {
                return `
              <tr>
            <td>${c.title}</td>
            <td>${c.count}</td>
            <td>
              <button
                class='btn btn-small js-remove'
                data-id=${c._id}
              >Видалити</button>
            </td>
          </tr>
            `;
              })
              .join('');
            $card.querySelector('tbody').innerHTML = html;
            $card.querySelector('.price').textContent = toCurrency(card.price);
            window.location.reload(); // через перезагрузку сторніки
          } else {
            $card.innerHTML = '<p>Корзина пуста</p>';
          }
        });
    }
  });
}
// ініціалізація в логіні
M.Tabs.init(document.querySelectorAll('.tabs'));

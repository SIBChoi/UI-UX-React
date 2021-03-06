import { render, screen } from '../test/setup';
import UserList from './UserList';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import userEvnet from '@testing-library/user-event';

const users = [
  {
    id: 1,
    username: 'user1',
    email: 'user1@mail.com',
    image: null,
  },
  {
    id: 2,
    username: 'user2',
    email: 'user2@mail.com',
    image: null,
  },
  {
    id: 3,
    username: 'user3',
    email: 'user3@mail.com',
    image: null,
  },
  {
    id: 4,
    username: 'user4',
    email: 'user4@mail.com',
    image: null,
  },
  {
    id: 5,
    username: 'user5',
    email: 'user5@mail.com',
    image: null,
  },
  {
    id: 6,
    username: 'user6',
    email: 'user6@mail.com',
    image: null,
  },
  {
    id: 7,
    username: 'user7',
    email: 'user7@mail.com',
    image: null,
  },
];

const getPage = (page, size) => {
  const start = page * size;
  const end = start + size;
  const totalPages = Math.ceil(users.length / size);

  return {
    content: users.slice(start, end),
    page,
    size,
    totalPages,
  };
};
const server = setupServer(
  rest.get('/api/1.0/users', (req, res, ctx) => {
    let page = Number.parseInt(req.url.searchParams.get('page'));
    let size = Number.parseInt(req.url.searchParams.get('size'));

    if (Number.isNaN(page)) {
      page = 0;
    }
    if (Number.isNaN(size)) {
      size = 5;
    }

    return res(ctx.status(200), ctx.json(getPage(page, size)));
  })
);

beforeAll(() => server.listen());

afterAll(() => server.close());

const setup = () => {
  render(<UserList />);
};

describe('User List', () => {
  it('displays thress users in list', async () => {
    setup();
    const users = await screen.findAllByText(/user/);
    expect(users.length).toBe(3);
  });
  it('displays next page link', async () => {
    setup();
    await screen.findByText('user1');
    expect(screen.getByText('next >')).toBeInTheDocument();
  });
  it('displays next page after clicking link', async () => {
    setup();
    await screen.findByText('user1');
    const nextPageLink = screen.getByText('next >');
    userEvnet.click(nextPageLink);
    const newUser = await screen.findByText('user4');
    expect(newUser).toBeInTheDocument();
  });
  it('dose not display next link at last page', async () => {
    setup();
    await screen.findByText('user1');
    userEvnet.click(screen.getByText('next >'));
    await screen.findByText('user4');
    userEvnet.click(screen.getByText('next >'));
    await screen.findByText('user7');
    expect(screen.queryByRole('next >')).not.toBeInTheDocument();
  });
  it('dose not display previous link at first page', async () => {
    setup();
    await screen.findByText('user1');
    const previousPageLink = screen.queryByText('< previous');
    expect(previousPageLink).not.toBeInTheDocument();
  });
  it('displays previous page link', async () => {
    setup();
    await screen.findByText('user1');
    const nextPageLink = screen.getByText('next >');
    userEvnet.click(nextPageLink);
    await screen.findByText('user4');
    const previousPageLink = screen.queryByText('< previous');
    expect(previousPageLink).toBeInTheDocument();
  });
  it('dispays previous page when cliking previous link', async () => {
    setup();
    await screen.findByText('user1');
    const nextPageLink = screen.getByText('next >');
    userEvnet.click(nextPageLink);
    await screen.findByText('user4');
    const previousPageLink = screen.queryByText('< previous');
    userEvnet.click(previousPageLink);
    const firstPageUser = await screen.findByText('user1');
    expect(firstPageUser).toBeInTheDocument();
  });
  it('displays spinner during the api call is in progress', async () => {
    setup();
    const spinner = screen.getByRole('status', { hidden: true });
    await screen.findByText('user1');
    expect(spinner).not.toBeInTheDocument();
  });
});

import React from 'react';
import { Link } from 'react-router-dom';

const moment = require('custom-moment');

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: 'Created at',
    render: coach =>
      moment(coach.createdAt)
        .tz(coach.timezone)
        .format('DD/MM/YYYY'),
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: 'Name',
    render: coach => (
      <Link to={`/admin/coaches/c/${coach.id}`}>{coach.name}</Link>
    ),
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
];

export default columns;

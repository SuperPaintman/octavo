'use strict';
/** Imports */
import {
  expect,
  makeAgent,
  Agent
} from '../helpers';


describe('Kernel', () => {
  let agent: Agent;
  beforeEach(async () => { agent = await makeAgent(); });

  describe('Controllers', () => {
    describe('Pure scope', () => {
      describe('Not Found', () => {
        it('should throws the "Not Found" error if route is not found', async () => {
          const res = await agent.get('/pure/road-not-found');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.body('Not Found');
        });
      });

      describe('Method Not Allowed', () => {
        it('should throws the "Method Not Allowed" error if passed method is wrong', async () => {
          const res = await agent.post('/pure/ping');

          expect(res)
            .to.have.status(405)
            .and.have.contentType('text/plain')
            .and.have.body('Method Not Allowed');
        });
      });

      describe('PingController', () => {
        it('should returns a valid response', async () => {
          const res = await agent.get('/pure/ping');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({ ping: 'pong' });
        });
      });

      describe('PlainTextController', () => {
        it('should returns a valid response', async () => {
          const res = await agent.get('/pure/plain-text');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('It is a plane text');
        });
      });

      describe('EchoController', () => {
        it('should returns a valid response', async () => {
          const res = await agent
            .post('/pure/echo')
            .send({
              message: 'Hello!',
              author: 'SuperPaintman'
            });

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({
              message: 'Hello!',
              author: 'SuperPaintman'
            });
        });
      });

      describe('FullpackResourceController', () => {
        it('should returns a valid response for "index"', async () => {
          expect(await agent.get('/pure/fullpack'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('List of resource');
        });

        it('should returns a valid response for "new"', async () => {
          expect(await agent.get('/pure/fullpack/new'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('Form for new resouce instance');
        });

        it('should returns a valid response for "show"', async () => {
          expect(await agent.get('/pure/fullpack/10'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('Show single respurce');
        });

        it('should returns a valid response for "create"', async () => {
          expect(await agent.post('/pure/fullpack'))
            .to.have.status(201)
            .and.have.contentType('text/plain')
            .and.have.body('Create new respurce');
        });

        it('should returns a valid response for "edit"', async () => {
          expect(await agent.get('/pure/fullpack/10/edit'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('Form for editing respurce');
        });

        it('should returns a valid response for "update"', async () => {
          expect(await agent.patch('/pure/fullpack/10'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('Update respurce');
        });

        it('should returns a valid response for "destroy"', async () => {
          expect(await agent.del('/pure/fullpack/10'))
            .to.have.status(200)
            .and.have.contentType('text/plain')
            .and.have.body('Destroy respurce');
        });
      });

      describe('BooksController', () => {
        it('should supports for return a empty list of books', async () => {
          const res = await agent.get('/pure/books');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body([]);
        });

        it('should supports for create a new book and returns it', async () => {
          const res = await agent
            .post('/pure/books')
            .send({
              author: 'Terry Pratchett',
              name: 'The Colour of Magic',
              year: 1983
            });

          expect(res)
            .to.have.status(201)
            .and.have.contentType('application/json')
            .and.have.body({
              id: 0,
              author: 'Terry Pratchett',
              name: 'The Colour of Magic',
              year: 1983
            });
        });

        it('should throws the "Validation Error" error if request body is invalid', async () => {
          const res = await agent
            .post('/pure/books')
            .send({
              author: 'Terry Pratchett'
            });

          expect(res)
            .to.have.status(400)
            .and.have.contentType('text/plain')
            .and.have.body('Validation Error');
        });

        it('should throws the "Book Not Found" error if book with passed id is not found', async () => {
          const res = await agent.get('/pure/books/100500');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.body('Book Is Not Found');
        });

        it('should supports for creating new book and updating a list of books', async () => {
          expect(await agent.get('/pure/books'))
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body([]);

          await agent
            .post('/pure/books')
            .send({
              author: 'Terry Pratchett',
              name: 'The Colour of Magic',
              year: 1983
            });

          await agent
            .post('/pure/books')
            .send({
              author: 'Terry Pratchett',
              name: 'Mort',
              year: 1987
            })

          expect(await agent.get('/pure/books/1'))
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({
              id: 1,
              author: 'Terry Pratchett',
              name: 'Mort',
              year: 1987
            });

          expect(await agent.get('/pure/books'))
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body([
              {
                id: 0,
                author: 'Terry Pratchett',
                name: 'The Colour of Magic'
              },
              {
                id: 1,
                author: 'Terry Pratchett',
                name: 'Mort'
              }
            ]);
        });
      });

      describe('BrokenController', () => {
        it('should returns a valid response', async () => {
          const res = await agent.get('/pure/broken');

          expect(res)
            .to.have.status(500)
            .and.have.contentType('text/plain')
            .and.have.body('Internal Server Error');
        });
      });
    });
  });
});

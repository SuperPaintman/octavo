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

      // Temporarily disabled because it is not supported now
      xdescribe('Method Not Allowed', () => {
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

  describe('Transformers', () => {
    describe('Scope with transformer', () => {
      describe('Not Found', () => {
        it('should throws a transformed "Not Found" error', async () => {
          const res = await agent.get('/transformer/road-not-found');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'error',
              error: {
                name: 'NotFound',
                message: 'Not Found'
              }
            });
        });

        it('should throws a transformed "Method Not Allowed" error even for very long pathes', async () => {
          const res = await agent.get('/transformer/road/not/found/and/it/is/not/defined');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'error',
              error: {
                name: 'NotFound',
                message: 'Not Found'
              }
            });
        });
      });

      // Temporarily disabled because it is not supported now
      xdescribe('Method Not Allowed', () => {
        it('should throws a transformed "Method Not Allowed" error', async () => {
          const res = await agent.post('/transformer/ping');

          expect(res)
            .to.have.status(405)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'error',
              error: {
                name: 'MethodNotAllowed',
                message: 'Method Not Allowed'
              }
            });
        });
      });

      describe('PingController', () => {
        it('should returns a transformed response', async () => {
          const res = await agent.get('/transformer/ping');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'success',
              data: {
                ping: 'pong'
              }
            });
        });
      });

      describe('EchoController', () => {
        it('should returns a valid response', async () => {
          const res = await agent
            .post('/transformer/echo')
            .send({
              message: 'Hello!',
              author: 'SuperPaintman'
            });

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'success',
              data: {
                message: 'Hello!',
                author: 'SuperPaintman'
              }
            });
        });
      });

      describe('BrokenController', () => {
        it('should returns a transformed response', async () => {
          const res = await agent.get('/transformer/broken');

          expect(res)
            .to.have.status(500)
            .and.have.contentType('application/json')
            .and.have.body({
              status: 'error',
              error: {
                name: 'InternalServerError',
                message: 'Internal Server Error'
              }
            });
        });
      });
    });
  });

  describe('Formatters', () => {
    describe('Scope with YAML formatter', () => {
      describe('Not Found', () => {
        it('should ignores a formatted if error is a plain text', async () => {
          const res = await agent
            .get('/formatter/road-not-found')
            .set('Accept', 'application/x-yaml');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.body('Not Found');
        });

        it('should ignores a formatted if error is a plain text even for very long pathes', async () => {
          const res = await agent
            .get('/formatter/road/not/found/and/it/is/not/defined')
            .set('Accept', 'application/x-yaml');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.body('Not Found');
        });
      });

      describe('PingController', () => {
        it('should returns a formatted response', async () => {
          const res = await agent
            .get('/formatter/ping')
            .set('Accept', 'application/x-yaml');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/x-yaml')
            .and.have.body('ping: pong\n');
        });
      });

      describe('EchoController', () => {
        it('should returns a formatted response', async () => {
          const res = await agent
            .post('/formatter/echo')
            .send({
              message: 'Hello!',
              author: 'SuperPaintman'
            })
            .set('Accept', 'application/x-yaml');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/x-yaml')
            .and.have.body([
              'message: Hello!',
              'author: SuperPaintman',
              ''
            ].join('\n'));
        });
      });

      describe('BrokenController', () => {
        it('should ignores a formatted if error is a plain text', async () => {
          const res = await agent
            .get('/formatter/broken')
            .set('Accept', 'application/x-yaml');

          expect(res)
            .to.have.status(500)
            .and.have.contentType('text/plain')
            .and.have.body('Internal Server Error');
        });
      });

      describe('Multiple formatters', () => {
        it('should formats response correctly for JSON and YAML "Access" headers', async () => {
          expect(
            await agent
              .get('/formatter/ping')
              .set('Accept', 'application/json')
          )
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({ ping: 'pong' });

          expect(
            await agent
              .get('/formatter/ping')
              .set('Accept', 'application/x-yaml')
          )
            .to.have.status(200)
            .and.have.contentType('application/x-yaml')
            .and.have.body('ping: pong\n');
        });

        it('should formats response as JSON if "Access" headers in not set', async () => {
          const res = await agent.get('/formatter/ping');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({ ping: 'pong' });
        });
      });
    });

    describe('Scope with overridden JSON fromatter', () => {
      it('should override default JSON formatter', async () => {
        const res = await agent.get('/overridden-json-formatter/ping');

        expect(res)
          .to.have.status(200)
          .and.have.contentType('application/json')
          .and.have.body([
            '{',
            '\t\t\t\t"ping": "pong"',
            '}'
          ].join('\n'));
      });
    });

    describe('Formatter with multi accepts', () => {
      it('should works', async () => {
        const resYaml = await agent
          .get('/formatter/ping')
          .set('Accept', 'application/x-yaml');

        const resYamlAlternative = await agent
          .get('/formatter/ping')
          .set('Accept', 'text/x-custom-accept');

        const resJson = await agent
          .get('/formatter/ping');

        for (const res of [resYaml, resYamlAlternative]) {
          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/x-yaml')
            .and.have.body('ping: pong\n');
        }

        expect(resJson)
          .to.have.status(200)
          .and.have.contentType('application/json')
          .and.have.body('{"ping":"pong"}');
      });
    });
  });

  describe('Middlewares', () => {
    describe('Scope with dummy header middleware', () => {
      describe('Not Found', () => {
        it('should set response header', async () => {
          const res = await agent.get('/middleware/road-not-found');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.header('Test-Header', 'Hello There');
        });
      });

      describe('PingController', () => {
        it('should set response header', async () => {
          const res = await agent.get('/middleware/ping');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({ ping: 'pong' })
            .and.have.header('Test-Header', 'Hello There');
        });
      });

      describe('EchoController', () => {
        it('should set response header', async () => {
          const res = await agent
            .post('/middleware/echo')
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
            })
            .and.have.header('Test-Header', 'Hello There');
        });
      });

      describe('BrokenController', () => {
        it('should set response header', async () => {
          const res = await agent.get('/middleware/broken');

          expect(res)
            .to.have.status(500)
            .and.have.contentType('text/plain')
            .and.have.body('Internal Server Error')
            .and.have.header('Test-Header', 'Hello There');
        });
      });
    });

    describe('Scope with middleware after response', () => {
      describe('Not Found', () => {
        it('should set header with info about request in header', async () => {
          const res = await agent.get('/middleware-after-response/road-not-found');

          expect(res)
            .to.have.status(404)
            .and.have.contentType('text/plain')
            .and.have.header('After-Response', 'GET:/middleware-after-response/road-not-found:error:404');
        });
      });

      describe('PingController', () => {
        it('should set header with info about request in header', async () => {
          const res = await agent.get('/middleware-after-response/ping');

          expect(res)
            .to.have.status(200)
            .and.have.contentType('application/json')
            .and.have.body({ ping: 'pong' })
            .and.have.header('After-Response', 'GET:/middleware-after-response/ping:success:200');
        });
      });

      describe('EchoController', () => {
        it('should set header with info about request in header', async () => {
          const res = await agent
            .post('/middleware-after-response/echo')
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
            })
            .and.have.header('After-Response', 'POST:/middleware-after-response/echo:success:200');
        });
      });

      describe('BrokenController', () => {
        it('should set header with info about request in header', async () => {
          const res = await agent.get('/middleware-after-response/broken');

          expect(res)
            .to.have.status(500)
            .and.have.contentType('text/plain')
            .and.have.body('Internal Server Error')
            .and.have.header('After-Response', 'GET:/middleware-after-response/broken:error:500');
        });
      });
    });
  });
});

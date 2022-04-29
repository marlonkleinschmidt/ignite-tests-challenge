import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';    
import { CreateUserError } from './CreateUserError';
import { ICreateUserDTO } from './ICreateUserDTO';

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository =new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a user", async () => {

    const user: ICreateUserDTO = {
      name: "NewUserTest",
      email: "newusertest@email.com",
      password: "123456"
    }
    
    const response = await createUserUseCase.execute(user);

    expect(response).toHaveProperty("id");

  });

  it("Should not be able to create a new user with same email", async ()=>{
    
    expect(async ()=>{
      const user = {
        name: "NewUserTest",
        email: "newusertest@email.com",
        password: "123456"
      }
      
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });
    }).rejects.toBeInstanceOf(CreateUserError);
    
  });
  
});
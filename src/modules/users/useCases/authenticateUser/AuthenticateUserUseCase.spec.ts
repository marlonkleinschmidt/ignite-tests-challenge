import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';    
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;


describe("Authenticate User",()=>{


  beforeAll(()=>{
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);    
  });


  it("Should be able to authenticate an user", async () => {

    const user: ICreateUserDTO = {
      name: "NewUserTest",
      email: "newusertest@email.com",
      password: "123456"
    }
    await createUserUseCase.execute(user);
    
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });
    
    expect(result).toHaveProperty("token");

  });

  it("Should not be able to authenticate an nonexistent user", () => {
    expect(async ()=> {
      await authenticateUserUseCase.execute({
        email: "failemail@email.com",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate with incorrect password", () => {
   
    expect(async ()=> {
      const user: ICreateUserDTO = {
        name: "NewUserTest",
        email: "novoemail@email.com",
        password: "123456"
      }
      await createUserUseCase.execute(user);
      
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "failPassword"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);

});

});
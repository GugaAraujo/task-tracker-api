import { knex } from 'knex';
import knexconfig from './config/knexconfig';

// import models
import { Project as ProjectModel } from '../models/project';
import { Task as TaskModel } from '../models/task';
import { User as UserModel } from '../models/user';

// export model interfaces
export { IProject } from '../models/project';
export { ITask } from '../models/task';
export { IUser } from '../models/user';

// Establish connection to database
const connection = knex(knexconfig);

// Assign models to auth database connection
ProjectModel.knex(connection);
TaskModel.knex(connection);
UserModel.knex(connection);

// export ready models
export const Project = ProjectModel;
export const Task = TaskModel;
export const User = UserModel;

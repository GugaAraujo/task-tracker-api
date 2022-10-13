import IProject from './project';

export default interface ITask {
    duration: number,
    description: string,
    project: IProject,
    date: string,
    id: number,
}